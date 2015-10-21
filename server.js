const express = require('express'),
      bodyParser = require('body-parser'),
      Promise = require('bluebird'),
      R = require('ramda'),
      validatejs = require('validate.js'),
      moment = require('moment'),
      app = express();

const db = require('./db'),
      CalendarEvent = require('./calendarEvent'),
      ValidationErrors = require('./validationErrors'),
      mailSender = require('./mailSender'),
      calendarSync = require('./calendarSync');

validatejs.Promise = Promise;
app.use(bodyParser.json());
app.use(finalErrorHandler);

db.connection.then((db) => setupRoutes(db));

const server  = app.listen(8080, function () {
  console.log('Server listening in port', server.address().port);
});

function setupRoutes(db) {

  const calendarEventsCollection = db.collection("calendarEvents");

  app.get('/event', getCalendarEventsRoute(calendarEventsCollection));
  app.get('/event/:id', getCalendarEventRoute(calendarEventsCollection));
  app.post('/event', createCalendarEventRoute(calendarEventsCollection));
  app.put('/event/:id', editCalendarEventRoute(calendarEventsCollection));
  app.delete('/event/:id', deleteCalendarEventRoute(calendarEventsCollection));
  app.post('/sync-from', getCalendarSyncFromRoute(calendarEventsCollection));
}

function getCalendarEventsRoute(eventsCollection) {
  return (req, res, next) => {
		eventsCollection.find(resolveEventQuery(req.query.searchQuery)).toArrayAsync()
		  .then((results) => res.status(200).json(results))
		  .catch(next)
  }
}
function resolveEventQuery(searchQuery){
  if(searchQuery){
    const dateQuery = moment(new Date(searchQuery));
    return dateQuery.isValid() ?
    {$and : [{'startTime' : {$lte: dateQuery.toDate()}}, {'endTime' : {$gte: dateQuery.toDate()}}]}
      :
    {$or : [
      {'description' : {$regex: searchQuery, $options: 'i'}},
      {'location' : {$regex: searchQuery, $options: 'i'}}
    ]}

  } else {
		return {};
	}
}

function getCalendarEventRoute(eventsCollection) {
  return (req, res, next) => {
    resolveObjectId(req.params.id)
      .then((objectId) => eventsCollection.findOneAsync({_id: objectId}))
      .then((result) => result != null ? res.status(200).json(result) : res.sendStatus(404))
      .catch(next)
  }
}

function sendEmailToNewAttendees(event, oldAttendees, newAttendees) {
  const recipients = resolveRecipientsForAttendanceEmail(oldAttendees, newAttendees);
  if(!R.isEmpty(recipients)){
    mailSender.sendAttendanceMail(event, recipients);
  }
}

function resolveRecipientsForAttendanceEmail(oldAttendees, newAttendees) {
  return oldAttendees ?  R.difference(newAttendees, oldAttendees) : newAttendees;
}

function createCalendarEventRoute(eventsCollection) {
  return (req, res, next) => {
    validate(req.body, CalendarEvent.constraints)
      .then((validatedData) => eventsCollection.insertAsync(toEventModel(validatedData)))
      .then((result) => {
        const created = result.ops[0];
        sendEmailToNewAttendees(created, null, created.attendees);
        return res.status(201).json(created);
      }  )
      .catch(ValidationErrors, (validationError) => res.status(401).json(validationError.errors))
      .catch(next)
  }
}

function editCalendarEventRoute(eventsCollection) {

  function continueEditing(oldEvent, req, res) {
    return validate(R.merge(oldEvent, req.body), CalendarEvent.constraints)
      .then((mergedEvent) => eventsCollection.findAndModifyAsync({_id: MongoDB.ObjectID(mergedEvent._id)}, [['_id','asc']], toEventModel(mergedEvent), {new: true}))
      .then((result) =>  {
        const updatedEvent = result.value;
        sendEmailToNewAttendees(updatedEvent, oldEvent.attendees, updatedEvent.attendees)
        return res.status(200).json(updatedEvent)
      })
  }


  return (req, res, next) => {
    resolveObjectId(req.params.id)
      .then((objectId) => eventsCollection.findOneAsync({_id: objectId}))
      .then((oldEvent) => oldEvent != null ? continueEditing(oldEvent, req, res) : Promise.reject(new NotFoundError()))
      .catch(NotFoundError, () => res.sendStatus(404))
      .catch(ValidationErrors, (validationError) => res.status(400).json(validationError.errors))
      .catch(next)
  }
}

function deleteCalendarEventRoute(eventsCollection) {
  return (req, res, next) => {
    resolveObjectId(req.params.id)
    .then((objectId) => eventsCollection.deleteOneAsync({_id: objectId}))
    .then((response) => response.result.n != 0 ? res.status(200).json(response) : res.sendStatus(404))
    .catch(next)
  }
}

function getCalendarSyncFromRoute(eventsCollection) {
  return (req, res, next) => {
    calendarSync.syncFromGoogle(eventsCollection)
      .then((results) => res.status(200).json(results))
      .catch(next)
  }
}

function toEventModel(data) {
  return R.mapObjIndexed((val, key) => key == "startTime" || key == "endTime" ? moment(val).toDate() : val
    , data)
}

function finalErrorHandler(err, req, res, next) {
  res.status(500).json(errorToObject(err))
}

function errorToObject(error) {
  return {message: error.message}
}

function NotFoundError() {
  Error.captureStackTrace(this, this.constructor);
}
NotFoundError.prototype = new Error();

function validate(attrs, constraints) {
  return validatejs.async(attrs,constraints, {wrapErrors: ValidationErrors})
}

function resolveObjectId(objectId) {
  //wraps synchornous function to Promise, so that invalid objectiId error handling comes for free
  return Promise.method((id) => MongoDB.ObjectId(id))(objectId)
}
