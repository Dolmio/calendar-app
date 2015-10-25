const fs = require('fs');
const conf = (() => JSON.parse(fs.readFileSync('./environment.json', 'utf8')))();

module.exports = {
  getClientSecret: () => conf.clientSecret,
  getCalendarApi: () => conf.calendarApi,
  mailAuth: conf.mailAuth
};