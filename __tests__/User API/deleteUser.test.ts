// import request from 'supertest';
// import User from '../../src/models/user.model';
// import server from '../../src/server';
// import jwt from 'jsonwebtoken';
// import { userValidation } from '../../src/middleware/user.validator.middleware';
// import { authenticateJWT } from '../../src/middleware/auth.middleware';
// import redisClient from '../../src/config/Redis.database';
// require('dotenv').config();
// import { graphql } from 'graphql';
// import schema from '../../src/grapQL/schema/schema';
// import mongoose from 'mongoose';

// import userQueue from '../../src/queue/user.queue';
// import emailQueue from '../../src/queue/email.queue';

// describe('DELETE /user/:id', () => {
//   beforeAll(async () => {
//     await mongoose.connect(process.env.MONGODB_URI as string);
//     jest.setTimeout(30000);
//   });

//   it('should delete user by id and return the deleted user data', async () => {
//     const query = `
//       mutation deleteUser($id: String!) {
//         deleteUser(id: $id) {
//           id
//           name
//           password
//           email
//           age
//         }
//       }
//     `;

//     const variables = {
//       id: '668e4052e3a784588ae863a7'
//     };

//     const result = await graphql({ schema, source: query, variableValues: variables });
//     const responseData: { deleteUser?: { id: string; name: string; email: string; password: string } } =
//       result.data || {};

//     expect(responseData.deleteUser).toBeDefined();
//     expect(responseData!.deleteUser!.name).toBe('Nguyen Tien Phat 1');
//     expect(responseData!.deleteUser!.password).toStrictEqual('12345');
//   });

//   afterAll(async () => {
//     await redisClient.disconnect();
//     await mongoose.disconnect();
//     await userQueue.close();
//     await emailQueue.close();
//   });
// });
