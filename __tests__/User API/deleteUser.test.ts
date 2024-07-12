import redisClient from '../../src/config/Redis.database';
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import { MONGODB_URI } from '../../src/config/const';
import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';
import UserModel, { IUser } from '../../src/models/user.model';

describe('DELETE /user/:id', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    jest.setTimeout(30000);
  });

  it('should delete user by id and return the deleted user data', async () => {
    // Tạo user mới trước
    const newUser = new UserModel({
      name: 'TestDelete',
      password: '12345',
      email: 'nguyen.tien.phat@example.com',
      age: 25
    });
    await newUser.save();

    const query = `
      mutation deleteUser($id: String!) {
        deleteUser(id: $id) {
          id
          name
          password
          email
          age
        }
      }
    `;

    const variables = {
      id: (newUser._id as IUser).toString()
    };

    console.log('ID: ', variables.id);

    const result = await graphql({ schema, source: query, variableValues: variables });
    const responseData: { deleteUser?: { name: string; email: string; password: string } } = result.data || {};

    expect(responseData.deleteUser).toBeDefined();
    expect(responseData!.deleteUser!.name).toBe(newUser.name);
    expect(responseData!.deleteUser!.password).toStrictEqual(newUser.password);
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await userQueue.close();
    await emailQueue.close();
  });
});
