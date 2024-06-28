import { IVoucher, VoucherModel } from '../models/voucher.model';
import { IEvent, EventModel } from '../models/event.model';
import { Request, Response } from 'express';
import { startSession } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import emailQueue from '../queue/email.queue';

class VoucherController {
  public async addNewEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body;
      const newEvent = new EventModel(eventData);

      await newEvent.save();
      res.status(400).json(newEvent);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  public async getAllEvent(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventModel.find();
      res.status(200).json(events);
    } catch (error) {
      res.status(400).json(error);
    }
  }

  public async requestVoucher(req: Request, res: Response): Promise<void> {
    const session = await startSession();
    session.startTransaction();

    const eventID = req.params.eventID;
    const { email } = req.body;

    try {
      const event = await EventModel.findOne({ eventID }).session(session);

      if (!event || event.maxQuantity <= event.issuedQuantity) {
        await session.abortTransaction();
        res.status(456).json('No vouchers available');
        return
      }

      const voucherCode = uuidv4();
      const voucher = new VoucherModel({
        voucherID: uuidv4(),
        eventID,
        voucherCode,
      });

      await voucher.save({ session });

      event.issuedQuantity += 1;
      await event.save({ session });

      await session.commitTransaction();
      session.endSession();

      emailQueue
        .add({
          to: email,
          subject: 'Your Voucher Code',
          text: `Here is your voucher code: ${voucherCode}`,
          html: `<p>Here is your voucher code: <strong>${voucherCode}</strong></p>`,
        })
        .catch((err) => {
          console.error('Failed to add email job to queue:', err);
        });

      res.status(200).json(voucher);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res
        .status(500)
        .json({ error: 'Failed to request voucher', details: error });
    }
  }
}

export default new VoucherController();
