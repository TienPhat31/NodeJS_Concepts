import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql'

export const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: {
    id: { type: GraphQLString },
    eventID: { type: GraphQLString },
    eventName: { type: GraphQLString },
    maxQuantity: { type: GraphQLInt },
    issuedQuantity: { type: GraphQLInt }
  }
})
