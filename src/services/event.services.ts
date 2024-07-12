import { EventModel, IEvent } from '../models/event.model';
import { Request, Response } from 'express';
import { EditingModel } from '../models/edit.model';
import UserModel from '../models/user.model';
import mongoose from 'mongoose';

class EventService {

  public async addEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    const newEvent = new EventModel(eventData);
    return await newEvent.save();
  }

  public async getAllEvents(): Promise<IEvent[]> {
    return await EventModel.find();
  }

  public async getEventById(eventId: string): Promise<IEvent> {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      throw new Error('Failed to fetch event by ID');
    }
  }

  public async updateEvent(eventId: string, eventData: any): Promise<any> {
    try {
      const updatedEvent = await EventModel.findByIdAndUpdate(eventId, eventData, { new: true });
      if (!updatedEvent) {
        throw new Error('Event not found');
      }
      return updatedEvent;
    } catch (error) {
      throw new Error('Failed to update event');
    }
  }

  public async deleteEvent(eventId: string): Promise<any> {
    try {
      const deletedEvent = await EventModel.findByIdAndDelete(eventId);
      if (!deletedEvent) {
        throw new Error('Event not found');
      }
      return deletedEvent;
    } catch (error) {
      throw new Error('Failed to delete event');
    }
  }

  public async checkEditable(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const userId = res.locals.user.id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const editing = await EditingModel.findOne({ eventId }).session(session);

      if (editing && editing.userId !== userId) {
        const userName = await UserModel.findOne({ _id: editing.userId }).session(session);
        await session.abortTransaction();
        session.endSession();
        res.status(409).json({
          message: `Event is currently being edited by another ${userName?.name}`
        });
        return;
      } else {
        await EditingModel.findOneAndUpdate({ eventId }, { userId }, { upsert: true, new: true, session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'You can edit event.' });
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ error });
    }
  }

  public async releaseEditing(eventId: string, userId: string): Promise<boolean> {
    try {
      const result = await EditingModel.deleteOne({ eventId, userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error in releaseEditing:', error);
      throw new Error('Failed to release editing.');
    }
  }

  public async maintainEditing(eventId: string, userId: string): Promise<string | null> {
    try {
      let editing = await EditingModel.findOne({ eventId });
      console.log('TIME BEFORE: ', editing?.expiry);

      if (editing) {
        if (editing.userId !== userId) {
          const editingUser = await UserModel.findOne({ _id: editing.userId });
          return `Event is currently being edited by another user: ${editingUser?.name}`;
        }
        editing.expiry = new Date(Date.now() + 5 * 60 * 1000);
        console.log('TIME AFTER: ', editing.expiry);
      } else {
        editing = new EditingModel({
          eventId,
          userId,
          expiry: new Date(Date.now() + 5 * 60 * 10000)
        });
      }

      await editing.save();
      return null;
    } catch (error) {
      console.error('Error in maintainEditing:', error);
      throw new Error('Failed to maintain editing status.');
    }
  }
}

export default new EventService();
