'use strict';

const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PWD,
  },
});

const sendConfirmationEmail = async (name, email, confirmationCode) => {
  try {
    await transport.sendMail({
      from: process.env.EMAIL_ID,
      to: email,
      subject: 'RankIQ - Please confirm your account',
      html: `<h1>Email Confirmation</h1>
      <h2>Hello ${name}</h2>
      <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
      <a href=${process.env.SERVER_URL}user/confirm/${confirmationCode}> Click here</a>
      </div>`,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = { sendConfirmationEmail };
