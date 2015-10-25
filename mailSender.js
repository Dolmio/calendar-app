const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('./config');
const transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  auth: {
    user: config.mailAuth.user,
    pass: config.mailAuth.pass
  }
}));

function sendAttendanceMail(event, recipients) {
  console.log("Sending email to: " + recipients)
  transporter.sendMail({
    from: 'calendar-app@app.com',
    to: recipients.join(';'),
    subject: 'Event invite from Calendar-app',
    text: "You have been invited to event " + event.description + "."
  });
}

module.exports = {
  sendAttendanceMail: sendAttendanceMail
};