const nodemailer = require('nodemailer');
const sendmailTransport = require('nodemailer-sendmail-transport');
const transporter = nodemailer.createTransport(sendmailTransport());

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