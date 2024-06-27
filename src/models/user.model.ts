import exp from 'constants';
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  age: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  age: { type: Number, require: true },
});

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
export { IUser };
