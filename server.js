var express = require('express');
var app = express();
var http = require('http').Server(app);
var knex = require('./db/knex.js');
var bodyParser = require('body-parser');

const port = process.env.PORT || 8080;

app.use(bodyParser.json());

http.listen(port, function(){
  console.log(`hello.\nlistening on ${port}.`);
});

app.get('/', function (req, res) {
  res.send("__singprocess server running__");
});

app.route('/practice_session')
  .post(function(req, res) {
    // add new practice session
    const newPracticeSession = req.body;
    knex('practice_sessions').insert(newPracticeSession, 'id')
      .then(practiceSessionId => knex('practice_sessions').where('id', parseInt(practiceSessionId)).first())
      .then(practiceSession => res.status(200).json(practiceSession));
  });
