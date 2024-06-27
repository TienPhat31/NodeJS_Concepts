import { IUser } from '../models/user.model';
import redisClient from '../config/Redis.database';
import Queue from 'bull';

const REDIS_URI =
  'redis://S66fAWLCzbh4H70sG6DAsM58sNpeajYR@redis-14674.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:14674';

const userQueue = new Queue<IUser>('userQueue', REDIS_URI);

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
