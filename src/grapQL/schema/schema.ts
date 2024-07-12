import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean
} from 'graphql';
import { UserType } from '../type/user.type';
import resolvers from '../resolvers/user.resolver';
import { EventType } from '../type/event.type';
import { VoucherType } from '../type/voucher.type';
import eventResolvers from '../resolvers/event.resolver';

const RootQueryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: resolvers.Query.users
    },

    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: resolvers.Query.user
    },

    events: {
      type: new GraphQLList(EventType),
      resolve: eventResolvers.Query.events
    },

    event: {
      type: EventType,
      args: {
        eventID: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Query.event
    },

    vouchers: {
      type: new GraphQLList(VoucherType),
      resolve: eventResolvers.Query.vouchers
    }
  }
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
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: resolvers.Mutation.addUser
    },

    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: resolvers.Mutation.deleteUser
    },

    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: resolvers.Mutation.editUser
    },

    addEvent: {
      type: EventType,
      args: {
        eventID: { type: new GraphQLNonNull(GraphQLString) },
        eventName: { type: new GraphQLNonNull(GraphQLString) },
        maxQuantity: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: eventResolvers.Mutation.createEvent
    },

    requestVoucher: {
      type: VoucherType,
      args: {
        eventID: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Mutation.requestVoucher
    },

    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: resolvers.Mutation.loginUser
    },

    register: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: resolvers.Mutation.register
    },

    checkEditable: {
      type: new GraphQLObjectType({
        name: 'CheckEditableResponse',
        fields: {
          message: { type: GraphQLString },
          success: { type: GraphQLBoolean }
        }
      }),
      args: {
        eventId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Mutation.checkEditable
    },

    releaseEditing: {
      type: new GraphQLObjectType({
        name: 'releaseEditingResponse',
        fields: {
          message: { type: GraphQLString },
          success: { type: GraphQLBoolean }
        }
      }),
      args: {
        eventId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Mutation.releaseEditing
    },

    maintainediting: {
      type: new GraphQLObjectType({
        name: 'maintainEditingResponse',
        fields: {
          message: { type: GraphQLString },
          success: { type: GraphQLBoolean }
        }
      }),
      args: {
        eventId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: eventResolvers.Mutation.maintainEditing
    }
  }
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType
});

export default schema;
