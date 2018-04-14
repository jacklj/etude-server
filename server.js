var express = require('express');
var app = express();
var http = require('http').Server(app);

const port = process.env.PORT || 8080;

http.listen(port, function(){
  console.log(`hello.\nlistening on ${port}.`);
});

app.get('/', function (req, res) {
  res.send("__singprocess server running__");
});

app.route('/practice_session')
  .post(function(req, res) {
    res.send('Add a practice session');
  });
