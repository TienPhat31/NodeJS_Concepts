import redisClient from '../../src/config/Redis.database';
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import emailQueue from '../../src/queue/email.queue';
import { MONGODB_URI } from '../../src/config/const';

describe('POST /:eventID/editable/maintain', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    jest.setTimeout(30000);
  });

  it('should return success true when the event is maintained when user is still editing', async () => {
    const mutation = `
      mutation MaintainEditing($eventId: String!, $userId: String!) {
        maintainediting(eventId: $eventId, userId: $userId) {
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
    const responseData: { maintainediting?: { message: string; success: boolean } } = result.data || {};

    // Kiểm tra kết quả
    expect(responseData).toBeDefined();
    expect(responseData!.maintainediting!.message).toBe('Editing status maintained successfully.');
    expect(responseData!.maintainediting!.success).toBe(true);
  });

  //   it('should return success false when the event is editable by the another user', async () => {
  //     const mutation = `
  //       mutation checkEditable($eventId: String!, $userId: String!) {
  //         checkEditable(eventId: $eventId, userId: $userId) {
  //           message
  //           success
  //         }
  //       }
  //     `;

  //     const variables = {
  //       eventId: '21',
  //       userId: '668e5734560d2b015a75d5b8'
  //     };

  //     const result = await graphql({ schema, source: mutation, variableValues: variables });
  //     const responseData: { checkEditable?: { message: string; success: boolean } } = result.data || {};

  //     expect(responseData.checkEditable).toBeDefined();
  //     expect(responseData!.checkEditable!.success).toBe(false);
  //   });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await emailQueue.close();
  });
});
