import mongoose from 'mongoose';
import Agenda from 'agenda';
require('dotenv').config();


const MONGODB_URI = process.env.MONGODB_URI as string

const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Đã kết nối đến Cơ sở dữ liệu MongoDB');

    // Initialize Agenda
    const agenda = new Agenda({ db: { address: MONGODB_URI } });

    // Define job to check database connection
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
    agenda.every('3 seconds', 'checkDatabaseConnection');
  } catch (error) {
    console.error('Lỗi khi kết nối đến Cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

export default connectDB;
