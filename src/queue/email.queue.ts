import Queue from 'bull';
import { EmailOptions, sendEmail } from '../middleware/sendEmail.middleware';
import { REDIS_URI } from '../config/const';

const emailQueue = new Queue<EmailOptions>('email', REDIS_URI as string);

emailQueue.process(async (job, done) => {
  try {
    await sendEmail(job.data);
    done();
  } catch (error) {
    done(new Error('Error sending email'));
  }
});

export default emailQueue;
