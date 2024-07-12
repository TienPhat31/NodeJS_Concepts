// src/queue/init.redis.ts
import { createClient } from 'redis';
require('dotenv').config();
import { REDIS_URI } from './const';

const redisClient = createClient({ url: REDIS_URI });

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

(async () => {
  await redisClient.connect();
})();

export default redisClient;
