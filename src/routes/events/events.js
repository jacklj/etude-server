import express from 'express';
import bodyParser from 'body-parser';
import _ from 'lodash';

import knex from '../../knex';
import { EVENT_TYPES } from '../../constants';
import {
  convertArrayIntoObjectIndexedByIds,
  deleteAnyEventSubtypeRecords,
  getEventsTableFields,
  getLessonsTableFields,
  getMasterclassesTableFields,
  getPerformancesTableFields,
  conditionallyUpdateEventsRecord,
  conditionallyUpdateLessonsRecord,
  conditionallyUpdateMasterclassRecord,
  conditionallyUpdatePerformanceRecord,
  deleteNotesAttachedToEvent,
  removeRepOrExerciseInstancesAttachedToEvent,
} from '../../helpers';
import {
  getEventsLocationsAndAddToResponse,
  getEventsRepOrExerciseInstancesAndAddToResponse,
  getInstanceRepertoireAndAddToResponse,
  getInstanceExercisesAndAddToResponse,
  getEventsNotesAndAddToResponse,
  getEventsAndRepertoireAndExercisePeopleAndAddToResponse,
  getPeopleAtEventsAndAddToResponse,
} from '../../services/normalizedQueries';
import { NoEventsError, EventNotFoundError } from '../../services/errors';
import { renderUpdateEventLogMessage } from '../../services/logging';
import lessonsRouter from './lessons';
import masterclassesRouter from './masterclasses';
import performancesRouter from './performances';
import practiceSessionsRouter from './practiceSessions';
import thoughtsRouter from './thoughts';

const eventsRouter = express.Router();
eventsRouter.use(bodyParser.json());

eventsRouter.use('/lessons', lessonsRouter);
eventsRouter.use('/masterclasses', masterclassesRouter);
eventsRouter.use('/performances', performancesRouter);
eventsRouter.use('/practice_sessions', practiceSessionsRouter);
eventsRouter.use('/thoughts', thoughtsRouter);

eventsRouter.get('/', (req, res) => {
  const response = {}; // for returning normalized data
  knex('events_master')
    .select('*')
    .then(events => {
      if (_.isEmpty(events)) throw new NoEventsError();
      response.events = convertArrayIntoObjectIndexedByIds(events, 'event_id');
    })
    .then(() => getEventsLocationsAndAddToResponse(response.events, response))
    .then(() => getPeopleAtEventsAndAddToResponse(response.events, response))
    .then(() => getEventsRepOrExerciseInstancesAndAddToResponse(response.events, response))
    .then(() => getInstanceRepertoireAndAddToResponse(response.rep_or_exercise_instances, response))
    .then(() => getInstanceExercisesAndAddToResponse(response.rep_or_exercise_instances, response))
    .then(() => getEventsNotesAndAddToResponse(response.events, response))
    .then(() => getEventsAndRepertoireAndExercisePeopleAndAddToResponse(response))
    .then(() => res.status(200).json(response))
    .catch(error => {
      if (error instanceof NoEventsError) {
        console.warn('404: no events found.'); // eslint-disable-line no-console
        res.status(404).send('No events found.');
      } else {
        // catch all other errors
        console.warn(error); // eslint-disable-line no-console
        res.status(400).json(error);
      }
    });
});

eventsRouter.get('/:id', (req, res) => {
  const eventId = req.params.id;
  const response = {};
  knex('events_master')
    .where({ event_id: eventId })
    .select('*')
    .then(eventsArray => {
      if (_.isEmpty(eventsArray)) throw new EventNotFoundError();
      response.events = convertArrayIntoObjectIndexedByIds(eventsArray, 'event_id');
    })
    .then(() => getEventsLocationsAndAddToResponse(response.events, response))
    .then(() => getPeopleAtEventsAndAddToResponse(response.events, response))
    .then(() => getEventsRepOrExerciseInstancesAndAddToResponse(response.events, response))
    .then(() => getInstanceRepertoireAndAddToResponse(response.rep_or_exercise_instances, response))
    .then(() => getInstanceExercisesAndAddToResponse(response.rep_or_exercise_instances, response))
    .then(() => getEventsNotesAndAddToResponse(response.events, response))
    .then(() => getEventsAndRepertoireAndExercisePeopleAndAddToResponse(response))
    .then(() => res.status(200).json(response))
    .catch(error => {
      if (error instanceof EventNotFoundError) {
        console.warn(`404: event with id ${eventId} not found.`); // eslint-disable-line no-console
        res.status(404).send(`Event with id ${eventId} not found.`);
      } else {
        // catch all other errors
        console.warn(error); // eslint-disable-line no-console
        res.status(400).json(error);
      }
    });
});

eventsRouter.put('/:id', (req, res) => {
  // Don't include other entities in response - any changes should not have
  // referenced any entities that the front end doesn't already have.
  // e.g. if the user has changed the location, they must have selected one
  // that is already in the front end's data store, so no need to return it again.
  const eventId = req.params.id;
  // 1. update events table
  const eventsRecord = getEventsTableFields(req.body);
  conditionallyUpdateEventsRecord(eventsRecord, eventId)
    .then(result => {
      if (_.isEmpty(result)) throw new EventNotFoundError();
      return result;
    })
    .then(result => {
      // 2. update event subtype tables
      switch (result.type) {
        case EVENT_TYPES.LESSON: {
          const lessonsRecord = getLessonsTableFields(req.body);
          return conditionallyUpdateLessonsRecord(lessonsRecord, result, eventId);
        }
        case EVENT_TYPES.MASTERCLASS: {
          const masterclassesRecord = getMasterclassesTableFields(req.body);
          return conditionallyUpdateMasterclassRecord(masterclassesRecord, result, eventId);
        }
        case EVENT_TYPES.PERFORMANCE: {
          const performanceRecord = getPerformancesTableFields(req.body);
          return conditionallyUpdatePerformanceRecord(performanceRecord, result, eventId);
        }
        default:
          return Promise.resolve(result); // just resolve with the event object
      }
    })
    .then(result => {
      const logMessage = renderUpdateEventLogMessage(result);
      console.log(logMessage); // eslint-disable-line no-console
      const normalizedResponse = {
        events: {
          [result.event_id]: result,
        },
      };
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      if (error instanceof EventNotFoundError) {
        console.warn(`404: event with id ${eventId} not found.`); // eslint-disable-line no-console
        res.status(404).send(`Event with id ${eventId} not found.`);
      } else {
        console.warn(error); // eslint-disable-line no-console
        res.status(400).json(error);
      }
    });
});


eventsRouter.delete('/:id', (req, res) => {
  const eventId = req.params.id;
  // 1. delete event subtype first, as it has a foreign key to the main event record
  deleteAnyEventSubtypeRecords(eventId)
    // 2. delete any notes attached directly to the event
    .then(() => deleteNotesAttachedToEvent(eventId))
    // 3. detach any rep or exercise instances from the event
    .then(() => removeRepOrExerciseInstancesAttachedToEvent(eventId))
    // 4. then delete the event record itself
    .then(() => knex.raw(`
      DELETE FROM events
      WHERE event_id=${eventId};
    `))
    .then(result => {
      if (result.rowCount === 0) throw new EventNotFoundError();
      console.log(`Event deleted (id: ${eventId})`); // eslint-disable-line no-console
      res.status(200).json({}); // HTTP 200 expects body - return empty JSON object
    })
    .catch(error => {
      if (error instanceof EventNotFoundError) {
        console.warn(`404: couldn't delete event with id ${eventId}, it was not found.`); // eslint-disable-line no-console
        res.status(404).send(`Couldn't delete event with id ${eventId}, it was not found.`);
      } else {
        console.warn(error); // eslint-disable-line no-console
        res.status(400).json(error);
      }
    });
});

eventsRouter.post('/:eventId/repertoire', (req, res) => {
  // Doesn't resolve repertoire entity, because the user will already have that
  // on the front end, having just selected it.
  const { eventId } = req.params;
  const { repertoireId } = req.body;
  const newRepertoireInstance = {
    event_id: eventId,
    repertoire_id: repertoireId,
  };
  knex('rep_or_exercise_instances')
    .insert([newRepertoireInstance])
    .returning(['rep_or_exercise_instance_id', 'event_id', 'repertoire_id'])
    .then(resultArray => resultArray[0])
    .then(result => {
      const normalizedResponse = {
        rep_or_exercise_instances: {
          [result.rep_or_exercise_instance_id]: result,
        },
      };
      console.log( // eslint-disable-line no-console
        `New repertoire instance added (rep_or_exercise_instance_id: ${result.rep_or_exercise_instance_id})`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

eventsRouter.post('/:eventId/exercises', (req, res) => {
  // Doesn't resolve repertoire entity, because the user will already have that
  // on the front end, having just selected it.
  const { eventId } = req.params;
  const { exerciseId } = req.body;
  const newExerciseInstance = {
    event_id: eventId,
    exercise_id: exerciseId,
  };
  knex('rep_or_exercise_instances')
    .insert([newExerciseInstance])
    .returning(['rep_or_exercise_instance_id', 'event_id', 'exercise_id'])
    .then(resultArray => resultArray[0])
    .then(result => {
      const normalizedResponse = {
        rep_or_exercise_instances: {
          [result.rep_or_exercise_instance_id]: result,
        },
      };
      console.log( // eslint-disable-line no-console
        `New exercise instance added (rep_or_exercise_instance_id: ${result.rep_or_exercise_instance_id})`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

eventsRouter.get('/in_progress', (req, res) => {
  // TODO 26th September 2018 This endpoint doesn't work - gives the following error:
  // error: invalid input syntax for integer: "in_progress"
  // No idea why.
  knex.raw(`
    SELECT * FROM events_master WHERE in_progress = TRUE;
  `)
    .then(inProgressEventsResult => convertArrayIntoObjectIndexedByIds(
      inProgressEventsResult.rows,
      'event_id',
    ))
    .then(inProgressEventsObject => res.status(200).json(inProgressEventsObject))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default eventsRouter;
