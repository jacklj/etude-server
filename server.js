var express = require('express');
var app = express();
var http = require('http').Server(app);
var knex = require('./db/knex.js');
var bodyParser = require('body-parser');
var cors = require('cors')

const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

http.listen(port, function(){
  console.log(`hello.\nlistening on ${port}.`);
});

app.get('/', function (req, res) {
  res.send("__singprocess server running__");
});

app.route('/practice_session')
  .get(function(req, res) {
    // return all practice_sessions
    knex('practice_sessions').select()
      .then(practiceSessions => res.status(200).json(practiceSessions));
  })
  .post(function(req, res) {
    // add new practice session
    const newPracticeSession = req.body;
    knex('practice_sessions').insert(newPracticeSession, 'id')
      .then(practiceSessionId => knex('practice_sessions').where('id', parseInt(practiceSessionId)).first())
      .then(practiceSession => res.status(200).json(practiceSession));
  });
