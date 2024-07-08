import { startSession } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import emailQueue from '../queue/email.queue'
import { EventModel } from '../models/event.model'
import { VoucherModel, IVoucher } from '../models/voucher.model'
import { EditingModel } from '../models/edit.model'
import UserModel from '../models/user.model'

class VoucherService {
  public async getAllVoucher(): Promise<IVoucher[]> {
    return await VoucherModel.find()
  }

  public async requestVoucher(eventID: string, email: string): Promise<any> {
    const eventExists = await EventModel.exists({ eventID })
    if (!eventExists) {
      return { message: 'Event does not exist' }
    }

    const session = await startSession()
    session.startTransaction()

    try {
      const event = await EventModel.findOneAndUpdate(
        {
          eventID,
          $expr: { $lte: ['$issuedQuantity', '$maxQuantity'] }
        },
        { $inc: { issuedQuantity: 1 } },
        { new: true, session }
      )

      if (!event || event.maxQuantity < event.issuedQuantity) {
        await session.abortTransaction()
        return { message: 'No vouchers available or event is currently being processed' }
      }

      const voucherCode = uuidv4()
      const voucher = new VoucherModel({ voucherID: uuidv4(), eventID, voucherCode })
      await voucher.save({ session })
      await event.save({ session })

      await session.commitTransaction()
      session.endSession()

      emailQueue
        .add({
          to: email,
          subject: 'Your Voucher Code',
          text: `Here is your voucher code: ${voucherCode}`,
          html: `<p>Here is your voucher code: <strong>${voucherCode}</strong></p>`
        })
        .catch((err) => {
          console.error('Failed to add email job to queue:', err)
        })

      return voucher
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction()
      }
      session.endSession()
      throw new Error('Failed to request voucher')
    }
  }
}

export default new VoucherService()
