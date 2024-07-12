import redisClient from '../../src/config/Redis.database';
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';
import { MONGODB_URI } from '../../src/config/const';

describe('POST /user', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    jest.setTimeout(30000);
  });

  it('should add a new user and return with user data', async () => {
    let testEmail: string;
    testEmail = `test_${Date.now()}@example.com`;
    const query = `
      mutation { 
        addUser(name:"Nguyen Tien Phat 1" email:"${testEmail}" age:12 password:"12345") {
          name
          email
        }
      }
    `;

    const result = await graphql({ schema, source: query });
    const responseData: { addUser?: { name: string; email: string } } = result.data || {};
    expect(responseData.addUser).toBeDefined();
    expect(responseData!.addUser!.name).toBe('Nguyen Tien Phat 1');
    expect(responseData!.addUser!.email).toBe(testEmail);
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await userQueue.close();
    await emailQueue.close();
  });
});
