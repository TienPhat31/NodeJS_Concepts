import Queue from 'bull';
import { EmailOptions, sendEmail } from '../middleware/sendEmail.middleware';
require('dotenv').config();

const REDIS_URI =
  'redis://S66fAWLCzbh4H70sG6DAsM58sNpeajYR@redis-14674.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:14674';

const emailQueue = new Queue<EmailOptions>('email', REDIS_URI);

emailQueue.process(async (job, done) => {
  try {
    await sendEmail(job.data);
    done()
  } catch (error) {
    done(new Error('Error sending email'));
  }
});

export default emailQueue;
