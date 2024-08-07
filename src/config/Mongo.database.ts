import mongoose from 'mongoose';
import Agenda from 'agenda';
require('dotenv').config();
import { MONGODB_URI } from './const';

//
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected MongoDB');

    const agenda = new Agenda({ db: { address: MONGODB_URI } });

    agenda.define('checkDatabaseConnection', async (job: any) => {
      try {
        await mongoose.connection.db.command({ ping: 1 });
        console.log('Kết nối đến Cơ sở dữ liệu ổn định.');
      } catch (error) {
        console.error('Lỗi khi kiểm tra kết nối đến Cơ sở dữ liệu:', error);
      }
    });

    // Start Agenda
    await agenda.start();
    console.log('Agenda đã được khởi động.');

    // Schedule job to run every 3 seconds
    agenda.every('300 second', 'checkDatabaseConnection');
  } catch (error) {
    console.error('Lỗi khi kết nối đến Cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

export default connectDB;
