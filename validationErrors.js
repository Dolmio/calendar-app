function ValidationErrors(errors, options, attributes, constraints) {
  Error.captureStackTrace(this, this.constructor);
  this.errors = errors;
}
ValidationErrors.prototype = new Error();

module.exports = ValidationErrors