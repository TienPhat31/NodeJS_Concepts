import { IEvent, EventModel } from '../models/event.model'
import { EditingModel } from '../models/edit.model'
import e, { Request, Response } from 'express'
import voucherServices from '../services/voucher.services'
import UserModel from '../models/user.model'
import eventServices from '../services/event.services'
import logger from '../logger'

class VoucherController {
  // Add new Event --> Test: Done
  public async addNewEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body
      const newEvent = await eventServices.addEvent(eventData)
      res.status(200).json({ message: 'Add new event success', newEvent })
      logger.info('Add new event success', { newEvent })
    } catch (error) {
      logger.error('Error adding new event', { error })
      res.status(500).json(error)
    }
  }

  // Display all Event
  public async getAllEvent(req: Request, res: Response): Promise<void> {
    //const user = res.locals.user.name
    try {
      const events = await eventServices.getAllEvents()
      res.status(200).json({ message: 'List of events', events })
    } catch (error) {
      res.status(500).json(error)
    }
  }

  public async getAllVoucher(req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await voucherServices.getAllVoucher()
      res.status(200).json({ message: 'List of vouchers', vouchers })
      logger.info('List of vouchers', { vouchers })
    } catch (error) {
      res.status(500).json(error)
      logger.error('Error', { error })
    }
  }

  // Request Voucher from Event
  public async requestVoucher(req: Request, res: Response): Promise<void> {
    const eventID = req.params.eventID
    const { email } = req.body

    try {
      const voucher = await voucherServices.requestVoucher(eventID, email)
      res.status(200).json({ message: 'Create voucher success', voucher })
    } catch (error) {
      res.status(500).json(error)
    }
  }

  // Display Edit Page
  public async getEditPage(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID
    const event = await EventModel.findById(eventId)

    if (!event) {
      res.status(404).send('Event not found')
      return
    }
    res.json({ event, user: res.locals.user })
  }

  // Check users is editing table or not ?
  public async checkEditable(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID
    const userId = res.locals.user.id

    try {
      const editing = await EditingModel.findOne({ eventId })
      const userName = await UserModel.findOne({ _id: editing?.userId })

      if (editing && editing.userId !== userId) {
        res.status(409).json({
          message: `Event is currently being edited by another ${userName?.name}`
        })
      } else {
        await EditingModel.findOneAndUpdate({ eventId }, { userId }, { upsert: true, new: true })
        res.status(200).json({ message: 'You can edit event. ' })
      }
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }

  // Release currently user is editing table for another user can edit
  public async releaseEditing(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID
    const userId = res.locals.user.id

    try {
      await EditingModel.deleteOne({ eventId, userId })
      res.status(200).json({ message: 'Released editing successfully.' })
    } catch (error) {
      console.error('Error in releaseEditing:', error) // Log the error
      res.status(500).json({ message: 'Failed to release editing.', error })
    }
  }

  // Add more time for user is editing
  public async maintainEditing(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID
    const userId = res.locals.user.id

    try {
      let editing = await EditingModel.findOne({ eventId })
      console.log('Thời gian trước khi plus: ', editing?.expiry)

      if (editing) {
        if (editing.userId !== userId) {
          // Nếu không phải, trả về lỗi vì người dùng khác đang chỉnh sửa
          const editingUser = await UserModel.findOne({ _id: editing.userId })
          res.status(409).json({
            message: `Event is currently being edited by another user: ${editingUser?.name}`
          })
          return
        }

        // Update timeOut
        editing.expiry = new Date(Date.now() + 5 * 60 * 1000)
        console.log('Thời gian sau khi plus: ', editing.expiry)
      } else {
        // Nếu không có bản ghi chỉnh sửa nào tồn tại, tạo mới
        editing = new EditingModel({
          eventId,
          userId,
          expiry: new Date(Date.now() + 5 * 60 * 1000)
        })
      }

      await editing.save()

      res.status(200).json({ message: 'Editing status maintained successfully.' })
    } catch (error) {
      res.status(500).json({ message: 'Failed to maintain editing status.', error })
    }
  }
}

export default new VoucherController()
