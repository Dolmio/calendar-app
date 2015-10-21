const Promise = require('bluebird');
const MongoDB = Promise.promisifyAll(require('mongodb'));

const connection = MongoDB.MongoClient.connectAsync('mongodb://localhost/calendar-app');

connection.catch((error) => {
  console.error(error);
  process.exit(1)
});

module.exports = {
  connection: connection
};