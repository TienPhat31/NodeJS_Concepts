import request from 'supertest';
import User from '../../src/models/user.model';
import server from '../../src/server';
import jwt from 'jsonwebtoken';
import redisClient from '../../src/config/Redis.database';
import { authenticateJWT } from '../../src/middleware/auth.middleware';
import { userValidation } from '../../src/middleware/user.validator.middleware';
import Joi, { ValidationError } from 'joi';

import mongoose from 'mongoose';
require('dotenv').config();

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('PUT /api/user/:evenID', () => {
  let userId: string;
  const MONGODB_URI = process.env.MONGODB_URI as string;
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);

    await User.deleteMany({});
    userQueue.close();
    emailQueue.close();

    // Create a user for testing
    // Create a user for testing
    let userData = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
      age: 30,
    });

    const user = await userData.save();

    userId = (user._id as string).toString();
  });

  // Example for Redis
  afterAll(async () => {
    await redisClient.disconnect();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  });

  //   beforeEach(async () => {
  //     await User.deleteMany({});
  //   });

  it('should edit a user and return 200 with updated user data', async () => {
    const updatedUserData = {
      name: 'John Doe Updated',
      email: 'john.doe.updated@example.com',
      age: 35,
    };
    // Mock JWT token
    const validToken = jwt.sign(
      { userId: 'someuserid' },
      process.env.JWT_ACCESS_KEY as string
    );

    const validateMock = jest.spyOn(userValidation, 'validate');
    validateMock.mockReturnValue({ error: undefined, value: updatedUserData });

    const req = {
      cookies: {
        token: validToken,
      },
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    // Authenticate using middleware
    await authenticateJWT(req, res, next);

    const response = await request(server)
      .put(`/api/user/${userId}`)
      .set('Cookie', [`token=${validToken}`])
      .send(updatedUserData)
      .expect(200);

    console.log('Response: ', response.body);

    // Verify response body
    expect(response.body).toMatchObject(updatedUserData);
    expect(response.status).toBe(200);

    // Ensure user is updated in the database
    console.log('User: ', userId);
    const updatedUser = await User.findOne({ _id: userId });
    console.log(updatedUser);
    expect(updatedUser).toMatchObject(updatedUserData);

    // Restore mocks
    validateMock.mockRestore();
  });

  it('should return 404 if user not found', async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const validToken = jwt.sign(
      { userId: 'someuserid' },
      process.env.JWT_ACCESS_KEY as string
    );

    const req = {
      params: { id: nonExistingId },
      cookies: { token: validToken },
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    // Authenticate using middleware
    await authenticateJWT(req, res, next);

    const response = await request(server)
      .delete(`/api/user/${nonExistingId}`)
      .set('Cookie', [`token=${validToken}`])
      .expect(404);

    // Verify response body (optional if you want to check error message)
    expect(response.status).toBe(404);

    // Restore mocks (if any)
  });
});
