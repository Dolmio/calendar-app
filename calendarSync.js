const R = require('ramda');
const MongoDB = require('mongodb');
const Promise = require('bluebird');

const googleClient = require('./google-client');

function syncFromGoogle(eventCollection) {
  return googleClient.listEvents().then((result) =>{

    const eventUpdates = R.map(R.curry(syncEventFromGoogle)(eventCollection), result.events)

    return Promise.all(eventUpdates).then((updates) =>{
      console.log("Succesfully synced ", updates.length, "events");
      return Promise.resolve({syncedEvents: updates.length});
    })
  })
}

function syncEventFromGoogle(eventCollection, event) {
  return eventCollection.findOneAsync({googleId: event.id}).then((oldEvent) => {
    const eventFromGoogle = fromGoogleEvent(event);
    if(oldEvent == null) {
      return eventCollection.insertAsync(eventFromGoogle);
    }
    else {
      const updatedEvent = R.merge(oldEvent, eventFromGoogle);
      return eventCollection.findAndModifyAsync({_id: MongoDB.ObjectID(updatedEvent._id)}, [['_id','asc']], updatedEvent, {new: true});
    }
  })
}
function handleDifferentDateFormatsFromGoogleEvent(event) {
  return event.start.date ?
  { startTime: new Date(event.start.date), endTime: new Date(event.end.date)}
    :
  { startTime: event.start.dateTime, endTime: event.end.dateTime}
}

function fromGoogleEvent(event) {
  return R.merge(handleDifferentDateFormatsFromGoogleEvent(event),
    {
      description: event.summary,
      location: event.location,
      googleId: event.id
    }
  );
}

module.exports = {syncFromGoogle};
