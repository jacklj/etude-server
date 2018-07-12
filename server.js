const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const cors = require('cors');

const knex = require('./db/knex.js');
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

http.listen(port, function(){
  console.log(`hello.\nlistening on ${port}.`);
});

app.get('/', function (req, res) {
  res.send("__singprocess server running__");
});

app.route('/practice_sessions')
  .get(function(req, res) {
    // return all practice_sessions
    knex('practice_sessions')
      .select()
      .then(practiceSessions => res.status(200).json(practiceSessions))
      .catch(error => {
        console.warn(error);
        res.status(400).json(error);
      });
  })
  .post(function(req, res) {
    // add new practice session
    const newPracticeSession = req.body;
    knex('practice_sessions')
      .returning(['id', 'name', 'start', 'end', 'notes', 'rating'])
      .insert(newPracticeSession)
      .then(resultArray => resultArray[0])
      .then(result => {
        console.log(`New practice session created (id: ${result.id}, name: ${result.name})`);
        res.status(200).json(result);
      });
  });

  app.use(require('./routes/locations.js'));
