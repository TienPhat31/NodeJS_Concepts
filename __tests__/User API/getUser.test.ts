import redisClient from '../../src/config/Redis.database';
require('dotenv').config();
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import { MONGODB_URI } from '../../src/config/const';

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('GET /user', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    jest.setTimeout(30000);
  });

  it('should display list of users', async () => {
    const query = `
      query {
        users {
          id
          name
          email
          age
        }
      }
    `;
    const result = await graphql({ schema, source: query });
    expect(result.data).toBeDefined();
    expect(result.data!.users).toBeDefined();
    expect((result.data!.users as jest.Mock).length).toBeGreaterThan(0);
  });

  it('should return special user base on user id', async () => {
    const query = `
      query user($id: String!) {
        user(id: $id) {
          id
          name
          email
          age
        }
      }
    `;

    const variables = {
      id: '668e580ceb5905ce5c3a365e'
    };

    const result = await graphql({
      schema,
      source: query,
      variableValues: variables
    });

    const responseData: { user?: { id: string; name: string; email: string; age: number } } = result.data || {};
    expect(responseData.user).toBeDefined();
    expect(responseData!.user!.name).toBe('Nguyen Tien Phat 1');
    expect(responseData!.user!.email).toBe('test_1720604684215@example.com');
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await userQueue.close();
    await emailQueue.close();
  });
});
