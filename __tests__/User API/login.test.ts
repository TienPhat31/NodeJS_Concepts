import request from 'supertest';
import User, { IUser } from '../../src/models/user.model';
import server from '../../src/server';
import redisClient from '../../src/config/Redis.database';

import bcrypt from 'bcrypt';
require('dotenv').config();

import userQueue from '../../src/queue/user.queue';
import emailQueue from '../../src/queue/email.queue';

describe('POST /api/login', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    userQueue.close();
    emailQueue.close();
  });

  // Example for Redis
  afterAll(async () => {
    await redisClient.disconnect();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    // Create a user for testing
    const hashedPassword = await bcrypt.hash('password', 10);
    await User.create({
      name: ' TienPhat',
      email: 'test@example.com',
      password: hashedPassword,
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should log in user and return access token', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201);

    // Verify response body
    expect(response.body).toHaveProperty('message', 'Login successfully');
    expect(response.header['set-cookie']).toBeDefined();
  });

  it('should return 400 if email is wrong', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({ email: 'test1@example.com', password: 'password' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Email wrong');
  });

  it('should return 400 if password is incorrect', async () => {
    const response = await request(server)
      .post('/api/user/login')
      .send({ email: 'test@example.com', password: '123456' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Password wrong');
  });
});
