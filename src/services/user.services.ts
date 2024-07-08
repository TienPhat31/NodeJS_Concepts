import User, { IUser } from '../models/user.model'
require('dotenv').config()

class UserService {
  public async addUser(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data)
    return await user.save()
  }

  public async getAllUsers(): Promise<IUser[]> {
    return await User.find()
  }

  public async editUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, data, { new: true })
  }

  public async deleteUser(id: string): Promise<IUser | null> {
    return await User.findByIdAndDelete(id)
  }

  public async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email })
  }
}

export default new UserService()
