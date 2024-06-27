import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import UserModel from '../../models/user.model';
import { userValidation } from '../../middleware/user.validator.middleware';
import { UserType } from '../type/user.type';
import resolvers from '../resolvers/user.resolver';

const RootQueryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: resolvers.Query.users,
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: resolvers.Query.user,
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: resolvers.Mutation.addUser,
    },

    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: resolvers.Mutation.deleteUser,
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType,
});

export default schema;
