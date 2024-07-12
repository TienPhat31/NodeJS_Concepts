import { IUser } from '../models/user.model';
import redisClient from '../config/Redis.database';
import Queue from 'bull';
import { REDIS_URI } from '../config/const';


const userQueue = new Queue<IUser>('userQueue', REDIS_URI as string);

userQueue.process('saveToRedis', async (job) => {
  const userData: IUser = job.data;

  const userString = JSON.stringify({
    _id: userData._id,
    name: userData.name.toString(),
    email: userData.email.toString(),
    age: userData.age.toString()
  });

  await redisClient.sAdd(`users`, userString);
  return userData;
});

export default userQueue;
