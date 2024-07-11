  import redisClient from '../../src/config/Redis.database';
  require('dotenv').config();
  import { graphql } from 'graphql';
  import schema from '../../src/grapQL/schema/schema';
  import mongoose from 'mongoose';
  import userQueue from '../../src/queue/user.queue';
  import emailQueue from '../../src/queue/email.queue';
  import voucherServices from '../../src/services/voucher.services';

  describe('POST /events/:eventID/voucher', () => {
    beforeAll(async () => {
      await mongoose.connect(process.env.MONGODB_URI as string);
      jest.setTimeout(30000);
    });

    it('should request a voucher and return the voucher data', async () => {
      const mutation = `
          mutation requestVoucher($eventID: String!, $email: String!) {
              requestVoucher(eventID: $eventID, email: $email) {
              voucherID
              eventID
              voucherCode
              }
        }
      `;

      const variables = {
        eventID: '432',
        email: '2@gmail.com'
      };

      const result = await graphql({ schema, source: mutation, variableValues: variables });
      const responseData: { requestVoucher?: { eventID: string; email: string } } = result.data || {};

      expect(responseData.requestVoucher).toBeDefined();
      expect(responseData!.requestVoucher!.eventID).toBe(variables.eventID);
    });

    afterAll(async () => {
      await redisClient.disconnect();
      await mongoose.disconnect();
      await userQueue.close();
      await emailQueue.close();
    });
  });
