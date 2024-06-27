// src/queue/init.redis.ts
import { createClient } from 'redis';
require('dotenv').config();


// Replace with your Redis connection details
const REDIS_URI = process.env.REDIS_URI

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
