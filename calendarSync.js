const R = require('ramda');
const MongoDB = require('mongodb');
const Promise = require('bluebird');

const googleClient = require('./google-client');

function syncFromGoogle(eventCollection) {
  return googleClient.listEvents().then((result) =>{

    const eventUpdates = R.map(R.curry(syncEventFromGoogle)(eventCollection), result.events)

    return Promise.all(eventUpdates).then((updates) =>{
      console.log("Succesfully synced ", updates.length, "events from Google);
      return Promise.resolve({syncedEvents: updates.length});
    })
  })
}

function syncToGoogle(eventCollection) {
  return eventCollection.find({}).toArrayAsync()
  .then((events) => {
      const eventUpdates = R.map(R.curry(syncEventToGoogle)(eventCollection), events);
      return Promise.all(eventUpdates).then((updates) =>{
        console.log("Succesfully synced ", updates.length, "events to Google");
        return Promise.resolve({syncedEvents: updates.length});
      })
    }
  )
}

function syncEventToGoogle(eventCollection, event) {
  if(event.googleId) {
    return googleClient.getEvent(event.googleId)
      .then((oldGoogleEvent) => {
        return googleClient.updateEvent(R.merge(fromGoogleEvent(oldGoogleEvent), toGoogleEvent(event)));
      })
  }
  else {
    return googleClient.createEvent(toGoogleEvent(event))
      .then((response) => {
        const googleEvent = response[0];
        return eventCollection.findOneAndUpdateAsync({_id: MongoDB.ObjectID(event._id)}, {$set: {googleId: googleEvent.id}})
      })
  }
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

function toGoogleEvent(event) {
  return {
    id: event.googleId,
    summary: event.description,
    location: event.location,
    attendees: event.attendees,
    start : {
      dateTime: event.startTime
    },
    end: {
      dateTime: event.endTime
    }
  }
}

function fromGoogleEvent(event) {
  return R.merge(handleDifferentDateFormatsFromGoogleEvent(event),
    {
      description: event.summary,
      location: event.location,
      googleId: event.id,
      attendees: event.attendees ? R.map(R.prop('email'), event.attendees) : []
    }
  );
}

module.exports = {syncFromGoogle, syncToGoogle};
