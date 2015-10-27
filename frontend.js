const express = require('express'),
      app = express(),
      fetch = require('node-fetch'),
      proxy = require('express-http-proxy');


const apiPath = "http://localhost:8081";

const server  = app.listen(8080, function () {
  console.log('Server listening in port', server.address().port);
});

app.use('/api', proxy(apiPath, {
  forwardPath: function(req, res) {
    return require('url').parse(req.url).path;
  }
}));

app.get('/', (req,res) => {
  fetch(apiPath + "/event")
    .then((results) => results.json())
    .then((json) => {
      res.render('calendar.ejs',{events: JSON.stringify(json)})
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({})
    });
});