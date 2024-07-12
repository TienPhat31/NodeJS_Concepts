import redisClient from '../../src/config/Redis.database';
require('dotenv').config();
import { graphql } from 'graphql';
import schema from '../../src/grapQL/schema/schema';
import mongoose from 'mongoose';
import { MONGODB_URI } from '../../src/config/const';

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('POST /events', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
    jest.setTimeout(30000);
  });

  it('should add a new event and return with event data', async () => {
    const mutation = `
      mutation CreateEvent($eventID: String!, $eventName: String!, $maxQuantity: Int!) {
        addEvent(eventID: $eventID, eventName: $eventName, maxQuantity: $maxQuantity) {
          eventID
          eventName
          maxQuantity
        }
      }
    `;

    const randomSuffix = Math.floor(Math.random() * 900) + 1;
    const eventID = `${randomSuffix}`;
    const variables = {
      eventID,
      eventName: `Sample Event ${eventID}`,
      maxQuantity: 100
    };

    const result = await graphql({ schema, source: mutation, variableValues: variables });
    const responseData: { addEvent?: { eventID: string; eventName: string; maxQuantity: number } } = result.data || {};

    console.log('Event: ', responseData);
    expect(responseData.addEvent).toBeDefined();
    expect(responseData!.addEvent!.eventName).toBe(variables.eventName);
    expect(responseData!.addEvent!.eventID).toBe(variables.eventID);
  });

  afterAll(async () => {
    await redisClient.disconnect();
    await mongoose.disconnect();
    await userQueue.close();
    await emailQueue.close();
  });
});
