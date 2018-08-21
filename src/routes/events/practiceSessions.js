import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../constants';

const practiceSessionsRouter = express.Router();
practiceSessionsRouter.use(bodyParser.json());

/* POST a practice sesssion (when not starting one - eg enter a past session,
* or plan a future one)
*/
practiceSessionsRouter.post('/', (req, res) => {
  const newEvent = req.body;
  newEvent.type = EVENT_TYPES.PRACTICE;
  knex('events')
    .insert([newEvent])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New practice session added (id: ${result.event_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

/*
* Start a new pratice session - creates a new practice session record, just
* containing the start time and the event type.
*/
practiceSessionsRouter.post('/start', (req, res) => {
  const start = new Date();
  const type = EVENT_TYPES.PRACTICE;
  knex('events')
    .insert([{ start, type }])
    .returning(['id as event_id', 'start'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New practice session started (id: ${result.event_id}, start: ${result.start})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

/*
* Finish a pratice session - finishes an existing pracice session, adding an end
* datetime as well as any other details added during the session.
*/
practiceSessionsRouter.put('/:id/finish', (req, res) => {
  const eventId = req.params.id;
  const practiceSession = req.body;
  practiceSession.end = new Date();
  knex('events')
    .where({ id: eventId })
    .update(practiceSession)
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`Practice session finished (id: ${result.event_id}, end: ${result.end})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default practiceSessionsRouter;
