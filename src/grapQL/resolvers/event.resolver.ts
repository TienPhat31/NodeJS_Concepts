// graphql/resolvers.ts
import { EventModel, IEvent } from '../../models/event.model'
import eventServices from '../../services/event.services'

const eventResolvers = {
  Query: {
    events: async () => {
      return EventModel.find().exec()
    },

    event: async (_: any, args: { id: string }) => {
      return EventModel.findById(args.id).exec()
    }
  },

  Mutation: {
    createEvent: async (_: any, args: { eventID: string; eventName: string; maxQuantity: number }) => {
      const { eventID, eventName, maxQuantity } = args
      const event = new EventModel({
        eventID,
        eventName,
        maxQuantity
      })

      return event.save()
    }
  }
}

export default eventResolvers
