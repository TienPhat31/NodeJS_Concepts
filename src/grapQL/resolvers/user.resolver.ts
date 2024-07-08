// graphql/resolvers.ts
import UserModel from '../../models/user.model'
import { userValidation } from '../../middleware/user.validator.middleware'

const resolvers = {
  Query: {
    users: async () => {
      return UserModel.find().exec()
    },

    user: async (_: any, args: { id: string }) => {
      return UserModel.findById(args.id).exec()
    }
  },

  Mutation: {
    addUser: async (_: any, args: { name: string; email: string; age: number; password: string }) => {
      const { error } = userValidation.validate(args)
      if (error) {
        throw new Error(error.details[0].message.replace(/"/g, ''))
      }

      const { name, email, age, password } = args
      const user = new UserModel({
        name,
        email,
        password,
        age
      })
      return user.save()
    },

    deleteUser: async (_: any, args: { id: string}) => {
      return UserModel.findByIdAndDelete(args.id)
    },

    editUser: async(_: any, args: {id: string; name: string; email: string; age: number; password: string}) => {
      const { id, ...update } = args
      const { error } = userValidation.validate(update)
      if (error) {
        throw new Error(error.details[0].message.replace(/"/g, ''))
      }

      const updatedUser = await UserModel.findByIdAndUpdate(id, update, { new: true })
      if (!updatedUser) {
        throw new Error('User not found')
      }
      return updatedUser
    }
  }
}

export default resolvers
