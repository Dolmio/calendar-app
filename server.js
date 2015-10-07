const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const MongoDB = Promise.promisifyAll(require('mongodb'));
const R = require('ramda');
const validatejs = require('validate.js');
const app = express();

const CalendarEvent = require('./calendarEvent');
const ValidationErrors = require('./validationErrors');

validatejs.Promise = Promise;
app.use(bodyParser.json());

MongoDB.MongoClient.connectAsync('mongodb://localhost/calendar-app')
  .then((db) => setupRoutes(db))
  .catch((error) => {
    console.error(error);
    process.exit(1)
  }
);

const server  = app.listen(3000, function () {
  console.log('Server listening in port', server.address().port);
});

function setupRoutes(db) {

  const calendarEventsCollection = db.collection("calendarEvents");

  app.get('/event', getCalendarEventsRoute(calendarEventsCollection));
  app.get('/event/:id', getCalendarEventRoute(calendarEventsCollection));
  app.post('/event', createCalendarEventRoute(calendarEventsCollection));
  app.put('/event/:id', editCalendarEventRoute(calendarEventsCollection));
  app.delete('/event/:id', deleteCalendarEventRoute(calendarEventsCollection));
}

function getCalendarEventsRoute(eventsCollection) {
  return (req, res) => {
		eventsCollection.find(resolveEventQuery(req.query.searchQuery)).toArrayAsync()
		  .then((results) => res.status(200).json(results))
		  .catch((error) => res.status(500).json(errorToObject(error)))
  }
}
function resolveEventQuery(searchQuery){
	if(searchQuery){
		return  {$or : [
			{'description' : {$regex: searchQuery, $options: 'i'}}, 
			{'location' : {$regex: searchQuery, $options: 'i'}}, 
			{$and : [{'startTime' : {$lte: Number(searchQuery) }}, {'endTime' : {$gte: Number(searchQuery)}}]}
		]};
	} else {
		return {};
	}
}

function getCalendarEventRoute(eventsCollection) {
  return (req, res) => {
    resolveObjectId(req.params.id)
      .then((objectId) => eventsCollection.findOneAsync({_id: objectId}))
      .then((result) => result != null ? res.status(200).json(result) : res.sendStatus(404))
      .catch((error) => res.status(500).json(errorToObject(error)))
  }
}

function createCalendarEventRoute(eventsCollection) {
  return (req, res) => {
    validate(req.body, CalendarEvent.constraints)
      .then(() => eventsCollection.insertAsync(req.body))
      .then((created) =>  res.status(201).json(created.ops[0]))
      .catch(ValidationErrors, (validationError) => res.status(401).json(validationError.errors))
      .catch((error) => res.status(500).json(errorToObject(error)))
  }
}

function editCalendarEventRoute(eventsCollection) {
  return (req, res) => {
    resolveObjectId(req.params.id)
      .then((objectId) => eventsCollection.findOneAsync({_id: objectId}))
      .then((event) => event != null ? validate(R.merge(event, req.body), CalendarEvent.constraints) : Promise.reject(new NotFoundError()))
      .then((mergedEvent) => eventsCollection.findAndModifyAsync({_id: MongoDB.ObjectID(mergedEvent._id)}, [['_id','asc']], mergedEvent, {new: true}))
      .then((result) =>  res.status(200).json(result.value))
      .catch(NotFoundError, () => res.sendStatus(404))
      .catch(ValidationErrors, (validationError) => res.status(400).json(validationError.errors))
      .catch((error) => res.status(500).json(errorToObject(error)))
  }
}

/*
same as editCalendarEventRoute but written with traditional callbacks
 */
/*
function editCalendarEventRouteCallbackStyle(eventsCollection) {
  return (req, res) => {
    var objectId;
    try {
      objectId = MongoDb.ObjectId(req.params.id)
    }catch(e) {
      return res.status(400).json(errorToObject(e))
    }

    eventsCollection.findOne({_id: objectId}, (err, event) => {
      if(err) {
        return res.status(500).json(errorToObject(error))
      }
      else if(event == null) {
        return res.sendStatus(404)
      }
      else {
        const merged = R.merge(event, req.body)
        const validationErrors = validatejs.validate(merged, CalendarEvent.constraints)

        if(validationErrors) {
          return res.status(400).json(errorToObject(validationErrors))
        }
        else{
          eventsCollection.findAndModifyAsync({_id: MongoDB.ObjectID(mergedEvent._id)}, [['_id','asc']], mergedEvent, {new: true}, (err, result) => {
            if(err) {
              res.status(500).json(errorToObject(error))
            }
            else {
              res.status(200).json(result.value)
            }
          })
        }
      }
    })
  }
}
*/
function deleteCalendarEventRoute(eventsCollection) {
  return (req, res) => {
    resolveObjectId(req.params.id)
    .then((objectId) => eventsCollection.deleteOneAsync({_id: objectId}))
    .then((response) => response.result.n != 0 ? res.status(200).json(response) : res.sendStatus(404))
    .catch((error) => res.status(500).json(errorToObject(error)))
  }
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
