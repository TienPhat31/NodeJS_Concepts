import { GraphQLObjectType, GraphQLString, GraphQLInt } from "graphql";

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    age: { type: GraphQLInt },
    password: {type: GraphQLString}
  },
});
