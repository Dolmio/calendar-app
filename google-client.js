const google = require('googleapis'),
  googleAuth = require('google-auth-library'),
  config = require('./config'),
  Promise = require('bluebird'),
  R = require('ramda');

const calendarId = 'mobile.cloud.calendar@gmail.com';
const calendar = google.calendar('v3');

function authorize() {
  const credentials = config.getClientSecret();
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0])

  oauth2Client.credentials = config.getCalendarApi();

  return oauth2Client
}

function defaultParams() {
  return {auth: authorize(), calendarId: calendarId}
}

module.exports = {

  listEvents: function() {
    return Promise.promisify(calendar.events.list)(R.merge(defaultParams(),
      {
        timeMin: (new Date()).toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
    }))
      .then(function(response) {
        return {events: response[0].items}
      })
  },

  getEvent: function(eventId) {
    return Promise.promisify(calendar.events.get)(R.merge(defaultParams(), {eventId: eventId}))
      .then(function(response) {
        return response[0]
      })
  },

  createEvent: function(event) {
    return Promise.promisify(calendar.events.insert)(R.merge( defaultParams(), {resource: event}))
  },

  updateEvent: function(event) {
    return Promise.promisify(calendar.events.update)(R.merge(defaultParams(), {resource: event, eventId: event.id}))
  },

  patchEvent: function(eventId, data) {
    return Promise.promisify(calendar.events.patch)(R.merge(defaultParams(), {eventId: eventId, resource: data}))
  },

  deleteEvent: function(eventId) {
    return Promise.promisify(calendar.events.delete)(R.merge(defaultParams(), {eventId: eventId}))
  }
}
