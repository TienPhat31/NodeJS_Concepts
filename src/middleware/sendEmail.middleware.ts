import transporter from '../config/Mailer';
require('dotenv').config();

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(option: EmailOptions): Promise<void> {
  const mailOptions = {
    from: 'From HD Nguyen Tien Phat',
    to: option.to,
    subject: option.subject,
    text: option.text,
    html: option.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {  
    throw new Error('Error sending email');
  }


}
