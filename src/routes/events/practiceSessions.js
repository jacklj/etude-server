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
practiceSessionsRouter.put('/:id/start', (req, res) => {
  const eventId = Number(req.params.id);
  const start = new Date();
  const practiceSessionUpdates = { start };

  // if a practice session is already in progress, can't start one
  // (where type: PRACTICE_SESSION, start isNotNull and end isNull)
  // or add a boolean inProgress field
  knex('events')
    .whereRaw("events.type='EVENT_TYPES.PRACTICE' AND events.start IS NOT NULL AND events.end IS NULL")
    .select()
    .then(result => {
      if (result.length !== 0) {
        const eventIdOfInProgressPracticeSession = result[0].id;
        if (eventId === eventIdOfInProgressPracticeSession) {
          console.log(`Practice session (id: ${eventId}) cant be started as it is already in progress`);
          res.status(400).json({ error: 'This practice session is already in progress!' });
        } else {
          console.log(`Practice session (id: ${eventId}) not started - one already in progress (id: ${eventIdOfInProgressPracticeSession})`);
          res.status(400).json({ error: 'An existing practice session is already in progress' });
        }
      } else {
        knex('events')
          .where({ id: eventId })
          .update(practiceSessionUpdates)
          .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
          .then(resultArray => resultArray[0])
          .then(newPracticeSession => {
            console.log(`Practice session started (id: ${newPracticeSession.event_id}, start: ${newPracticeSession.start})`);
            res.status(200).json(newPracticeSession);
          });
      }
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

/*
* Finish a pratice session - finishes an existing pracice session, adding an end
* datetime.
*/
practiceSessionsRouter.put('/:id/finish', (req, res) => {
  const eventId = req.params.id;
  const practiceSession = {};
  practiceSession.end = new Date();

  knex('events')
    .where({ id: eventId })
    .first()
    .then(pS => {
      if (pS.start === null) {
        console.log(`Practice session (id: ${eventId}) cant be finished, as it hasn't started`);
        res.status(400).json({ error: "Practice session can't be finished, as it hasn't started" });
      } else if (pS.end !== null) {
        console.log(`Practice session (id: ${eventId}) cant be finished, as it's already finished`);
        res.status(400).json({ error: 'Practice session already finished' });
      } else {
        knex('events')
          .where({ id: eventId })
          .update(practiceSession)
          .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
          .then(resultArray => resultArray[0])
          .then(result => {
            console.log(`Practice session finished (id: ${result.event_id}, end: ${result.end})`);
            res.status(200).json(result);
          });
      }
    })

    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default practiceSessionsRouter;
