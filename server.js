const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const CalendarEvent = require('./calendarEvent');

mongoose.connect('mongodb://localhost/calendar-app');

const db = mongoose.connection;

db.on('error', function(callback) {
  console.error(callback);
  process.exit(1);
});

db.once('open', () => setupRoutes());

app.use(bodyParser.json())

function setupRoutes() {
  app.get('/', function(req, res) {
    res.send('hello world');
  });

  app.get('/event' , getCalendarEventsRoute);
  app.post('/event', createCalendarEventRoute);
}

function getCalendarEventsRoute(req, res) {
  CalendarEvent.find().exec().then(function(results) {
    res.sendStatus(results)
  }, function(error) {
    res.status(500).json(error)
  })
}

function createCalendarEventRoute(req, res) {
  CalendarEvent.create(req.body, function(err, created) {
    if(err) {
      res.status(500).json(err.errors)
    }
    else {
      res.status(200).json(created)
    }
  })
}

const server  = app.listen(3000, function () {
  console.log('Server listening in port', server.address().port);
});