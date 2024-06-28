import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const adminEmail = process.env.EMAIL;
const adminPassword = process.env.PASSWORD;

const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'nguyentienphat2103@gmail.com',
    pass: 'rren aaea hoco hcwz',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// transporter.verify(function (error, success) {
//   if (error) {
//     console.log('Error configuring transporter: ', error);
//   } else {
//     console.log('Server is ready to take our messages');
//   }
// });

export default transporter;
