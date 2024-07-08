import request from 'supertest';
import User, { IUser } from '../../src/models/user.model';
import server from '../../src/server';
import redisClient from '../../src/config/Redis.database';
require('dotenv').config();

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('POST /api/register', () => {
  beforeAll(async () => {
    const REDIS_URI = process.env.REDIS_URI;
    // Clear the database or set up a test database before tests
    await User.deleteMany({});
    userQueue.close();
    emailQueue.close();
  });

  // Example for Redis
  afterAll(async () => {
    await redisClient.disconnect();
    if (server) {
      await new Promise((resolve) => server.close(resolve)); // Close Express server
    }
  });

  it('should register a new user', async () => {
    const res = await request(server).post('/api/user/register').send({
      username: 'testuser1',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should return error for duplicate email', async () => {
    const res = await request(server).post('/api/user/register').send({
      username: 'testuser2',
      email: 'test@example.com',
      password: 'password456',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already exists');
  });
});
