// graphql/resolvers.ts
import { EventModel, IEvent } from '../../models/event.model';
import eventServices from '../../services/event.services';
import voucherServices from '../../services/voucher.services';
import mongoose from 'mongoose';
import { EditingModel } from '../../models/edit.model';
import UserModel from '../../models/user.model';

const eventResolvers = {
  Query: {
    events: async () => {
      return EventModel.find().exec();
    },

    event: async (_: any, args: { id: string }) => {
      return EventModel.findById(args.id).exec();
    },

    vouchers: async () => {
      return voucherServices.getAllVoucher();
    }
  },

  Mutation: {
    createEvent: async (_: any, args: { eventID: string; eventName: string; maxQuantity: number }) => {
      const { eventID, eventName, maxQuantity } = args;
      const event = new EventModel({
        eventID,
        eventName,
        maxQuantity
      });
      return event.save();
    },

    requestVoucher: async (_: any, args: { eventID: string; email: string }) => {
      const { eventID, email } = args;

      try {
        const voucher = await voucherServices.requestVoucher(eventID, email);
        return voucher;
      } catch (error) {
        throw new Error(`Failed to request voucher: ${error}`);
      }
    },

    checkEditable: async (_: any, args: { eventId: string; userId: string }) => {
      const { eventId, userId } = args;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const editing = await EditingModel.findOne({ eventId }).session(session);

        if (editing && editing.userId !== userId) {
          const userName = await UserModel.findOne({ _id: editing.userId }).session(session);
          await session.abortTransaction();
          session.endSession();
          return {
            message: `Event is currently being edited by another ${userName?.name}`,
            success: false
          };
        } else {
          await EditingModel.findOneAndUpdate({ eventId }, { userId }, { upsert: true, new: true, session });
          await session.commitTransaction();
          session.endSession();
          return {
            message: 'You can edit event.',
            success: true
          };
        }
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Failed to check editability: ${error}`);
      }
    },

    releaseEditing: async (_: any, args: { eventId: string; userId: string }) => {
      const { eventId, userId } = args;
      try {
        const released = await eventServices.releaseEditing(eventId, userId);

        if (released) {
          return { message: 'Released editing successfully', success: true };
        } else {
          return { message: 'No user editing  found to release', success: false };
        }
      } catch (error) {
        throw new Error(`Failed to release editing: ${error}`);
      }
    },

    maintainEditing: async (_: any, args: { eventId: string; userId: string }) => {
      const { eventId, userId } = args;
      try {
        const errorMessage = await eventServices.maintainEditing(eventId, userId);

        if (errorMessage) {
          return { message: 'Failed to maintain editing event', success: false };
        } else {
          return { message: 'Editing status maintained successfully.', success: true };
        }
      } catch (error) {
        console.error('Error in maintainEditingResolver:', error);
        throw new Error(`Failed to maintain editing status: ${error}`);
      }
    }
  }
};

export default eventResolvers;
