import { IUser } from '../models/user.model';
import redisClient from '../config/Redis.database';
import Queue from 'bull';
require('dotenv').config();


const REDIS_URI = process.env.REDIS_URI;

const userQueue = new Queue<IUser>('userQueue', REDIS_URI as string);

// Process function for handling 'saveToRedis' job
userQueue.process('saveToRedis', async (job) => {
  const userData: IUser = job.data;

  const userString = JSON.stringify({
    _id: userData._id,
    name: userData.name.toString(),
    email: userData.email.toString(),
    age: userData.age.toString(),
  });

  await redisClient.sAdd(`users`, userString);
  return userData;
});

export default userQueue;
