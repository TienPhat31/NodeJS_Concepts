import { number } from 'joi'
import mongoose, { Document, Schema } from 'mongoose'

interface IEvent extends Document {
  eventID: string
  eventName: string
  maxQuantity: number
  issuedQuantity: number
}

const EventSchema = new Schema<IEvent>({
  eventID: { type: String, required: true, unique: true },
  eventName: { type: String, required: true },
  maxQuantity: { type: Number, required: true },
  issuedQuantity: { type: Number, default: 0 }
})

const EventModel = mongoose.model<IEvent>('Event', EventSchema)

export { IEvent, EventModel }
