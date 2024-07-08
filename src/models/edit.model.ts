import mongoose, { Document, Schema } from 'mongoose';

interface IEdit extends Document {
  eventId: string;
  userId: string;
  timestamp: Date;
  expiry: Date;
}

const EditingSchema = new Schema<IEdit>({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  expiry: { type: Date, default: Date.now }
});

const EditingModel = mongoose.model<IEdit>('Edit', EditingSchema);

export { IEdit, EditingModel };
