import { EventModel, IEvent } from '../models/event.model'
import { IVoucher } from '../models/voucher.model'

class EventService {
  public async addEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    const newEvent = new EventModel(eventData)
    return await newEvent.save()
  }

  public async getAllEvents(): Promise<IEvent[]> {
    return await EventModel.find()
  }

  public async getEventById(eventId: string): Promise<IEvent> {
    try {
      const event = await EventModel.findById(eventId)
      if (!event) {
        throw new Error('Event not found')
      }
      return event
    } catch (error) {
      throw new Error('Failed to fetch event by ID')
    }
  }

  public async updateEvent(eventId: string, eventData: any): Promise<any> {
    try {
      const updatedEvent = await EventModel.findByIdAndUpdate(eventId, eventData, { new: true })
      if (!updatedEvent) {
        throw new Error('Event not found')
      }
      return updatedEvent
    } catch (error) {
      throw new Error('Failed to update event')
    }
  }

  public async deleteEvent(eventId: string): Promise<any> {
    try {
      const deletedEvent = await EventModel.findByIdAndDelete(eventId)
      if (!deletedEvent) {
        throw new Error('Event not found')
      }
      return deletedEvent
    } catch (error) {
      throw new Error('Failed to delete event')
    }
  }
}

export default new EventService()
