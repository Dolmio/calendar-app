const express = require('express'),
      app = express(),
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
  res.render('calendar.ejs');
});