import nodeMailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL, PASSWORD } from './const';

const transporter = nodeMailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export default transporter;
