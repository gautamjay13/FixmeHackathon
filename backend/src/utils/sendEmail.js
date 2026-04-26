const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

const templates = {
  welcomeEmail: (name) => `
    <h1>Welcome to FixNow, ${name}!</h1>
    <p>We are thrilled to have you on board. You can now book home services easily.</p>
  `,
  bookingConfirmation: (bookingId, serviceType) => `
    <h1>Booking Confirmed</h1>
    <p>Your booking <b>${bookingId}</b> for ${serviceType} has been created successfully. We are finding a worker for you.</p>
  `,
  bookingAccepted: (bookingId, workerName) => `
    <h1>Worker Assigned!</h1>
    <p>${workerName} has accepted your booking <b>${bookingId}</b>. They are on their way!</p>
  `,
  bookingCompleted: (bookingId, amount) => `
    <h1>Job Completed</h1>
    <p>Your booking <b>${bookingId}</b> has been completed. The final amount is INR ${amount}. Please find the invoice attached or in your app.</p>
  `,
  paymentReceipt: (bookingId, amount) => `
    <h1>Payment Successful</h1>
    <p>We have received your payment of INR ${amount} for booking <b>${bookingId}</b>.</p>
  `,
  otpEmail: (otp) => `
    <h1>Password Reset</h1>
    <p>Your OTP for password reset is: <b>${otp}</b>. It will expire in 10 minutes.</p>
  `,
  workerApproved: (name) => `
    <h1>Account Approved</h1>
    <p>Congratulations ${name}! Your worker account has been approved. You can now start accepting jobs.</p>
  `
};

module.exports = { sendEmail, templates };
