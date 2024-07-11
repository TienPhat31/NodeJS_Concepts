import redisClient from '../../src/config/Redis.database';
require('dotenv').config();
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import emailQueue from '../../src/queue/email.queue';

describe('POST /:eventID/editable/release', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    jest.setTimeout(30000);
  });

  it('should return success true when the event is released by the user', async () => {
    const mutation = `
      mutation releaseEditing($eventId: String!, $userId: String!) {
        releaseEditing(eventId: $eventId, userId: $userId) {
          message
          success
        }
      }
    `;

    const variables = {
      eventId: '21',
      userId: '668e571833732251834bc4bb'
    };

    const result = await graphql({ schema, source: mutation, variableValues: variables });
    const responseData: { releaseEditing?: { message: string; success: boolean } } = result.data || {};

    expect(responseData.releaseEditing).toBeDefined();
    expect(responseData!.releaseEditing!.success).toBe(true);
    expect(responseData!.releaseEditing!.message).toBe('Released editing successfully');
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await emailQueue.close();
  });

  it('should return fail true when the event is not released by the user', async () => {
    const mutation = `
      mutation releaseEditing($eventId: String!, $userId: String!) {
        releaseEditing(eventId: $eventId, userId: $userId) {
          message
          success
        }
      }
    `;

    const variables = {
      eventId: '212',
      userId: '668e571833732251834bc4bb'
    };

    const result = await graphql({ schema, source: mutation, variableValues: variables });
    const responseData: { releaseEditing?: { message: string; success: boolean } } = result.data || {};

    expect(responseData.releaseEditing).toBeDefined();
    expect(responseData!.releaseEditing!.success).toBe(false);
    expect(responseData!.releaseEditing!.message).toBe('No user editing  found to release');
  });

  afterAll(async () => {
    //await redisClient.disconnect();
    await mongoose.disconnect();
    await emailQueue.close();
  });
});
