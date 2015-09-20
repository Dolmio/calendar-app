const validate = require('validate.js');
const moment = require('moment');

validate.moment = moment;
validate.validators.before = beforeValidator;

const constraints =  {
  _id:{},
  description: {
    presence: true
  },
  location: {},

  startTime: {
    presence: true,
    datetime: true,
    before: "endTime"
  },

  endTime: {
    presence: true,
    datetime: true
  }
};

function beforeValidator(value, options, key, attributes) {
  const other = attributes[options];
  return value < other ? null : value + " must be smaller than " + other
}

module.exports = {constraints};