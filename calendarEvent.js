const validate = require('validate.js');
const moment = require('moment');
const R = require('ramda');

validate.moment = moment;
validate.validators.before = beforeValidator;
validate.validators.emailArray = emailArray;


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
  },

  attendees: {
    emailArray: true
  }

};

function emailArray(value, options, key, attributes){
  if (value &&
    !(R.isArrayLike(value) &&
      R.all((element) => validate.validators.email.PATTERN.test(element), value))){
    return value + " must be array of emails";
  }
}

function beforeValidator(value, options, key, attributes) {
  const other = attributes[options];
  return value < other ? null : value + " must be smaller than " + other
}

module.exports = {constraints};