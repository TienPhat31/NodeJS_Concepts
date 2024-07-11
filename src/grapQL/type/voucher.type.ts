import { GraphQLObjectType, GraphQLString } from 'graphql'

export const VoucherType = new GraphQLObjectType({
  name: 'Voucher',
  fields: {
    voucherID: { type: GraphQLString },
    eventID: { type: GraphQLString },
    voucherCode: { type: GraphQLString }
  }
})
