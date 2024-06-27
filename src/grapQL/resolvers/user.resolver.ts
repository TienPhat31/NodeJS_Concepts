// graphql/resolvers.ts
import UserModel from '../../models/user.model';
import { userValidation } from '../../middleware/user.validator.middleware';

const resolvers = {
  Query: {
    users: async () => {
      return UserModel.find().exec();
    },
    user: async (_: any, args: { id: string }) => {
      return UserModel.findById(args.id).exec();
    },
  },

  Mutation: {
    addUser: async (
      _: any,
      args: { name: string; email: string; age: number }
    ) => {
      const { error } = userValidation.validate(args);
      if (error) {
        throw new Error(error.details[0].message.replace(/"/g, ''));
      }

      const { name, email, age } = args;
      const user = new UserModel({
        name,
        email,
        age,
      });
      return user.save();
    },
    deleteUser: async (_: any, args: { id: string }) => {
      return UserModel.findByIdAndDelete(args.id);
    },
  },
};

export default resolvers;
