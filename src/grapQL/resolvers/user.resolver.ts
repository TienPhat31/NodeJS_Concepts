// graphql/resolvers.ts
import UserModel from '../../models/user.model';
import { IUser } from '../../models/user.model';
import { userValidation } from '../../middleware/user.validator.middleware';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';


const resolvers = {
  Query: {
    users: async () => {
      return UserModel.find().exec();
    },

    user: async (_: any, args: { id: string }) => {
      return UserModel.findById(args.id).exec();
    }
  },

  Mutation: {
    addUser: async (_: any, args: { name: string; email: string; age: number; password: string }) => {
      const { error } = userValidation.validate(args);
      if (error) {
        throw new Error(error.details[0].message.replace(/"/g, ''));
      }

      const { name, email, age, password } = args;
      const user = new UserModel({
        name,
        email,
        password,
        age
      });
      return user.save();
    },

    deleteUser: async (_: any, args: { id: string }) => {
      return UserModel.findByIdAndDelete(args.id);
    },

    editUser: async (_: any, args: { id: string; name: string; email: string; age: number; password: string }) => {
      const { id, ...update } = args;
      const { error } = userValidation.validate(update);
      if (error) {
        throw new Error(error.details[0].message.replace(/"/g, ''));
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, update, { new: true });
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return updatedUser;
    },

    loginUser: async (
      _: any,
      args: { email: string; password: string },
      { req, res }: { req: Request; res: Response }
    ): Promise<IUser> => {
      const { email, password } = args;

      const accessKey = process.env.JWT_ACCESS_KEY as string;

      try {
        const user = await UserModel.findOne({ email });
        if (user) {
          const isMatch = await password === user.password;
          if (isMatch) {
            const accessToken = jwt.sign({ id: user._id, name: user.name }, accessKey, {
              expiresIn: '30m'
            });
            res.cookie('token', accessToken, {
              httpOnly: true,
              secure: false, // Đặt true nếu sử dụng HTTPS
              maxAge: 30 * 60 * 1000 // Thời gian sống của cookie, ví dụ 30 phút
            });
            return user;
          } else {
            throw new Error('Password wrong');
          }
        } else {
          throw new Error('Email wrong');
        }
      } catch (error) {
        throw new Error(error as string);
      }
    },

    register: async (_: any, args: { name: string; email: string; password: string; age: number }): Promise<IUser> => {
      try {
        const { name, email, password, age } = args;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          throw new Error('Email already exists');
        }

        const newUser = new UserModel({
          name,
          email,
          password,
          age
        });

        await newUser.save();

        return newUser;
      } catch (error) {
        throw new Error('Server error');
      }
    }
  }
};

export default resolvers;
