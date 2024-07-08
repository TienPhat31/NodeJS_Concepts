import request from 'supertest';
import User from '../../src/models/user.model';
import server from '../../src/server';
import jwt from 'jsonwebtoken';
import redisClient from '../../src/config/Redis.database';
import { authenticateJWT } from '../../src/middleware/auth.middleware';
import { userValidation } from '../../src/middleware/user.validator.middleware';

import mongoose from 'mongoose';
require('dotenv').config();

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('DELETE /api/user/userID', () => {
  let userId: string;
  const MONGODB_URI = process.env.MONGODB_URI as string;
  
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);

    await User.deleteMany({});
    userQueue.close();
    emailQueue.close();

    // Create a user for testing
    let userData = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
      age: 30,
    });

    const user = await userData.save();

    userId = (user._id as string).toString();
    console.log(userId);
  });

  afterAll(async () => {
    await redisClient.disconnect();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  });

  it('should delete a user and return 200 with deleted user data', async () => {
    // Mock JWT token
    const validToken = jwt.sign(
      { userId: 'someuserid' },
      process.env.JWT_ACCESS_KEY as string
    );

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

    console.log(userId);
    const response = await request(server)
      .delete(`/api/user/${userId}`)
      .set('Cookie', [`token=${validToken}`])
      .expect(200);

    // Verify response body
    expect(response.body).toHaveProperty('_id', userId);
    expect(response.status).toBe(200);

    // Ensure user is deleted
    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });

  it('should return 500 if user does not exist', async () => {
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
      params: { id: 'nonexistinguserid' }, // Non-existent user ID
      body: updatedUserData,
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
      .put(`/api/user/nonexistinguserid`)
      .set('Cookie', [`token=${validToken}`])
      .send(updatedUserData)
      .expect(500);

    // Verify response body (optional if you want to check error message)
    expect(response.status).toBe(500);

    // Restore mocks
    validateMock.mockRestore();
  });
});
