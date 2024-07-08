import request from 'supertest';
import User from '../../src/models/user.model';
import server from '../../src/server';
import jwt from 'jsonwebtoken';
import redisClient from '../../src/config/Redis.database';
import { userValidation } from '../../src/middleware/user.validator.middleware';
import { authenticateJWT } from '../../src/middleware/auth.middleware';
import Joi, { ValidationError } from 'joi';
require('dotenv').config();

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('POST /api/user', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    userQueue.close();
    emailQueue.close();
  });

  afterAll(async () => {
    await redisClient.disconnect();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should add a new user and return 200 with user data', async () => {
    const userData = {
      name: 'John Doe',
      password: 'password',
      email: 'john.doe@example.com',
      age: 30,
    };

    // Mock JWT token
    const validToken = jwt.sign(
      { userId: 'someuserid' },
      process.env.JWT_ACCESS_KEY as string
    );

    const validateMock = jest.spyOn(userValidation, 'validate');
    validateMock.mockReturnValue({ error: undefined, value: userData });

    const saveMock = jest.spyOn(User.prototype, 'save');
    saveMock.mockResolvedValue({
      _id: 'someuserid',
      ...userData,
    } as any);

    const req = {
      cookies: {
        token: validToken, // Set valid token in cookies
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
      .post('/api/user')
      .set('Cookie', [`token=${validToken}`])
      .send(userData)
      .expect(200);

    // Verify response body
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
    expect(response.status).toBe(200);

    // Restore mocks
    validateMock.mockRestore();
    saveMock.mockRestore();
  });

  it('should return 400 if validation fails', async () => {
    const userData = {
      // Missing 'name' field intentionally to trigger validation error
      password: 'password',
      email: 'john.doe@example.com',
      age: 30,
    };

    // Mock JWT token
    const validToken = jwt.sign(
      { userId: 'someuserid' },
      process.env.JWT_ACCESS_KEY as string
    );

    const validateMock = jest.spyOn(userValidation, 'validate');
    validateMock.mockReturnValue({
      error: {
        isJoi: true,
        details: [{ message: 'Validation error' }], // Mock Joi validation error
      } as ValidationError,
      value: undefined,
    });

    const req = {
      cookies: {
        token: validToken, // Set valid token in cookies
      },
      body: userData,
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    const next = jest.fn();

    // Authenticate using middleware
    await authenticateJWT(req, res, next);

    const response = await request(server)
      .post('/api/user')
      .set('Cookie', [`token=${validToken}`])
      .send(userData)
      .expect(400);

    // Verify response body (optional if you want to check error message)
    expect(response.status).toBe(400);

    // Restore mocks
    validateMock.mockRestore();
  });
});
