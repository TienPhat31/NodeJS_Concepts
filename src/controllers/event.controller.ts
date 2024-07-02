import { IVoucher, VoucherModel } from '../models/voucher.model';
import { IEvent, EventModel } from '../models/event.model';
import { EditingModel } from '../models/edit.model';
import { Request, Response } from 'express';
import { startSession } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import emailQueue from '../queue/email.queue';
import UserModel from '../models/user.model';

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
    const user = res.locals.user.name;
    try {
      const events = await EventModel.find();
      res.render('event', { user, events });
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
        return;
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

  public async getEditPage(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const event = await EventModel.findById(eventId);

    if (!event) {
      res.status(404).send('Event not found');
      return;
    }
    res.json({ event, user: res.locals.user });
  }

  public async checkEditable(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const userId = res.locals.user.id;

    try {
      const editing = await EditingModel.findOne({ eventId });
      const userName = await UserModel.findOne({ _id: editing?.userId });

      if (editing && editing.userId !== userId) {
        res.status(409).json({
          message: `Event is currently being edited by another ${userName?.name}`,
        });
      } else {
        await EditingModel.findOneAndUpdate(
          { eventId },
          { userId, expiry: new Date(Date.now() + 5 * 60 * 1000) },
          { upsert: true, new: true }
        );
        res.status(200).json({ message: 'You can edit event. ' });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  public async releaseEditing(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const userId = res.locals.user.id;

    try {
      //const editing = await EditingModel.findOne({ eventId, userId });

      // if (!editing) {
      //   res
      //     .status(404)
      //     .json({ message: 'User is not currently editing this event.' });
      //   return;
      // } else {
      await EditingModel.deleteOne({ eventId, userId });
      res.status(200).json({ message: 'Released editing successfully.' });
      return;
    } catch (error) {
      res.status(500).json({ message: 'Failed to release editing.', error });
    }
  }
}

export default new VoucherController();
