const mongoose = require('mongoose')

const CalendarEvent = mongoose.Schema({
  description: {type: String, required: true},
  location: String,
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true, validate: [dateValidator, 'startTime must be less than endTime']}
});

function dateValidator(value) {
  // `this` is the mongoose document
  return this.startTime < value;
}

module.exports = mongoose.model("CalendarEvent", CalendarEvent);