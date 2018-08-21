import express from 'express';
import HTTP from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import locationsRoutes from './routes/locations';
import eventsRouter from './routes/events/events';
import notesRoutes from './routes/notes';
import repertoireRoutes from './routes/repertoire';
import exercisesRoutes from './routes/exercises';
import peopleRoutes from './routes/people';
import itemsRoutes from './routes/items';
import knex from './knex';

const app = express();
const http = HTTP.Server(app);
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

http.listen(port, () => {
  console.log(`hello.\nlistening on ${port}.`); // eslint-disable-line no-console
});

app.get('/', (req, res) => {
  res.send('__singprocess server running__');
});

app
  .route('/practice_sessions')
  .get((req, res) => {
    // return all practice_sessions
    knex('practice_sessions')
      .select()
      .then(practiceSessions => res.status(200).json(practiceSessions))
      .catch(error => {
        console.warn(error); // eslint-disable-line no-console
        res.status(400).json(error);
      });
  })
  .post((req, res) => {
    // add new practice session
    const newPracticeSession = req.body;
    knex('practice_sessions')
      .returning(['id', 'name', 'start', 'end', 'notes', 'rating'])
      .insert(newPracticeSession)
      .then(resultArray => resultArray[0])
      .then(result => {
        console.log(`New practice session created (id: ${result.id}, name: ${result.name})`); // eslint-disable-line no-console
        res.status(200).json(result);
      });
  });

const base = '/api';
app.use(locationsRoutes);
app.use(`${base}/events`, eventsRouter);
app.use(notesRoutes);
app.use(repertoireRoutes);
app.use(exercisesRoutes);
app.use(peopleRoutes);
app.use(itemsRoutes);
