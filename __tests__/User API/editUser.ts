require('dotenv').config();
import mongoose from 'mongoose';
import schema from '../../src/grapQL/schema/schema';
import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';
import { graphql } from 'graphql';
import redisClient from '../../src/config/Redis.database';

describe('PUT /user/:id', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    jest.setTimeout(30000);
  });

  it('should edit user by id and return the updated user data', async () => {
    const mutation = `
      mutation EditUser($id: String!, $name: String!, $email: String!, $age: Int!, $password: String!) {
        editUser(id: $id, name: $name, email: $email, age: $age, password: $password) {
          id
          name
          email
          age
          password
        }
      }
    `;

    const variables = {
      id: '668e571833732251834bc4bb',
      name: 'Nguyễn Thủy Ngân',
      email: 'ngan@gmail.com',
      age: 12,
      password: 'ngan'
    };

    try {
      const result = await graphql({ schema, source: mutation, variableValues: variables });
      const responseData: { editUser?: { id: string; name: string; email: string; password: string; age: number } } =
        result.data || {};

      expect(responseData.editUser).toBeDefined();
      expect(responseData!.editUser!.id).toBe(variables.id);
      expect(responseData!.editUser!.name).toBe(variables.name);
      expect(responseData!.editUser!.email).toBe(variables.email);
      expect(responseData!.editUser!.age).toBe(variables.age);
      expect(responseData!.editUser!.password).toBe(variables.password);
    } catch (error) {
      console.error('GraphQL Request Error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await userQueue.close();
    await emailQueue.close();
  });
});
