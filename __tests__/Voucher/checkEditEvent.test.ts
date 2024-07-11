import redisClient from '../../src/config/Redis.database';
require('dotenv').config();
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import eventServices from '../../src/services/event.services';
import emailQueue from '../../src/queue/email.queue';

describe('POST /:eventID/editable/me', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    jest.setTimeout(30000);
  });

  it('should return success true when the event is editable by the user', async () => {
    const mutation = `
      mutation checkEditable($eventId: String!, $userId: String!) {
        checkEditable(eventId: $eventId, userId: $userId) {
          message
          success
        }
      }
    `;

    const variables = {
      eventId: '21',
      userId: '668e571833732251834bc4bb'
    };

    jest.spyOn(eventServices, 'maintainEditing').mockResolvedValue(null);

    const result = await graphql({ schema, source: mutation, variableValues: variables });
    const responseData: { checkEditable?: { message: string; success: boolean } } = result.data || {};

    expect(responseData.checkEditable).toBeDefined();
    expect(responseData!.checkEditable!.success).toBe(true);
    expect(responseData!.checkEditable!.message).toBe('You can edit event.');
  });

  it('should return success false when the event is editable by the another user', async () => {
    const mutation = `
      mutation checkEditable($eventId: String!, $userId: String!) {
        checkEditable(eventId: $eventId, userId: $userId) {
          message
          success
        }
      }
    `;

    const variables = {
      eventId: '21',
      userId: '668e5734560d2b015a75d5b8'
    };

    const result = await graphql({ schema, source: mutation, variableValues: variables });
    const responseData: { checkEditable?: { message: string; success: boolean } } = result.data || {};

    expect(responseData.checkEditable).toBeDefined();
    expect(responseData!.checkEditable!.success).toBe(false);
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await emailQueue.close();
  });
});
