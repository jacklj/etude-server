import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../services/constants';

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
    .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
    .then(resultArray => resultArray[0])
    .then(result => {
      const normalizedResponse = {
        events: {
          [result.event_id]: result,
        },
      };
      console.log(`New practice session added (id: ${result.event_id})`); // eslint-disable-line no-console
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

/*
* Start a new pratice session - creates a new practice session record, just
* containing the start time and the event type.
*/
practiceSessionsRouter.put('/:id/start', (req, res) => {
  const eventId = Number(req.params.id);
  const practiceSessionUpdates = {
    start: new Date(),
    in_progress: true,
  };
  // if a practice session is already in progress, can't start one
  knex('events')
    .where({ in_progress: true })
    .select()
    .then(inProgressEvents => {
      if (inProgressEvents.length !== 0) {
        const eventIdOfInProgressPracticeSession = inProgressEvents[0].event_id;
        if (eventId === eventIdOfInProgressPracticeSession) {
          console.log(`Practice session (id: ${eventId}) cant be started as it is already in progress`); // eslint-disable-line no-console
          res.status(400).json({ error: 'This practice session is already in progress!' });
        } else {
          console.log(`Practice session (id: ${eventId}) not started - one already in progress (id: ${eventIdOfInProgressPracticeSession})`); // eslint-disable-line no-console
          res.status(400).json({ error: 'An existing practice session is already in progress' });
        }
      } else {
        knex('events')
          .where({ event_id: eventId })
          .update(practiceSessionUpdates)
          .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
          .then(resultArray => resultArray[0])
          .then(result => {
            const normalizedResponse = {
              events: {
                [result.event_id]: result,
              },
            };
            console.log(`Practice session started (id: ${result.event_id}, start: ${result.start})`); // eslint-disable-line no-console
            res.status(200).json(normalizedResponse);
          });
      }
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

/*
* Finish a pratice session - finishes an existing pracice session, adding an end
* datetime.
*/
practiceSessionsRouter.put('/:id/finish', (req, res) => {
  const eventId = req.params.id;
  const practiceSessionUpdates = {
    end: new Date(),
    in_progress: false,
  };
  knex('events')
    .where({ event_id: eventId })
    .first()
    .then(pS => {
      if (pS.in_progress === false) {
        console.log(`Practice session (id: ${eventId}) cant be finished, as it isn't in progress`); // eslint-disable-line no-console
        res.status(400).json({ error: "Practice session can't be finished, as it isn't in progress" });
      } else {
        knex('events')
          .where({ event_id: eventId })
          .update(practiceSessionUpdates)
          .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
          .then(resultArray => resultArray[0])
          .then(result => {
            const normalizedResponse = {
              events: {
                [result.event_id]: result,
              },
            };
            console.log(`Practice session finished (id: ${result.event_id}, end: ${result.end})`); // eslint-disable-line no-console
            res.status(200).json(normalizedResponse);
          });
      }
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default practiceSessionsRouter;
