import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES, ITEM_TYPES } from '../../constants';
import {
  convertArrayIntoObjectIndexedByIds,
  deleteAnyEventSubtypeRecords,
  getEventItems,
  getEventsTableFields,
  getLessonsTableFields,
  getMasterclassesTableFields,
  getPerformancesTableFields,
  getEventGeneralNotes,
  getEventLocation,
  resolveEventSubtype,
  conditionallyUpdateEventsRecord,
  conditionallyUpdateLessonsRecord,
  conditionallyUpdateMasterclassRecord,
  conditionallyUpdatePerformanceRecord,
} from '../../helpers';
import {
  getEventsLocationsAndAddToResponse,
  getEventsRepOrExerciseInstancesAndAddToResponse,
  getInstanceRepertoireAndAddToResponse,
  getInstanceExercisesAndAddToResponse,
  getEventsNotesAndAddToResponse,
  getEventsAndRepertoireAndExercisePeopleAndAddToResponse,
} from '../../services/normalizedQueries';
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
      response.events = convertArrayIntoObjectIndexedByIds(events, 'event_id');
    })
    .then(() => getEventsLocationsAndAddToResponse(response.events, response))
    // .then(events => Promise.all(events.map(getPeopleAtEvent)))
    // TODO 24 Sept 2018 return People at Events (and the relevant people)
    .then(() => getEventsRepOrExerciseInstancesAndAddToResponse(response.events, response))
    .then(() => getInstanceRepertoireAndAddToResponse(response.rep_or_exercise_instances, response))
    .then(() => getInstanceExercisesAndAddToResponse(response.rep_or_exercise_instances, response))
    .then(() => getEventsNotesAndAddToResponse(response.events, response))
    .then(() => getEventsAndRepertoireAndExercisePeopleAndAddToResponse(response))
    .then(() => res.status(200).json(response))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

eventsRouter.get('/:id', (req, res) => {
  const eventId = req.params.id;
  knex('events')
    .where({ id: eventId })
    .first('id as event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress')
    .then(getEventLocation)
    .then(resolveEventSubtype)
    .then(getPeopleAtEvent)
    .then(getEventItems)
    .then(getEventGeneralNotes)
    .then(lesson => res.status(200).json(lesson))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

eventsRouter.put('/:id', (req, res) => {
  const eventId = req.params.id;
  // 1. update event fields in db
  const eventsRecord = getEventsTableFields(req.body);
  conditionallyUpdateEventsRecord(eventsRecord, eventId)
    .then(result => {
      // 2. update event subtype fields
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
    // 2. resolve full lesson object
    .then(getEventLocation)
    .then(getEventItems)
    .then(getEventGeneralNotes)
    .then(result => {
      const logMessage = renderUpdateEventLogMessage(result);
      console.log(logMessage);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

const deleteNotesAttachedToEvent = eventId => knex('notes')
  .where({ event_id: eventId })
  .del();

const deleteItemsAttachedToEvent = eventId => knex('items')
// Must also delete item subtype records.
// Don't delete notes attached to items (so when you look at all notes ever
// made on a piece, these notes are still there)
// 1. get all items added to this event
  .where({ event_id: eventId })
  .select()
// 2. delete each items sub-instance record (either a repertoire or
// exercise instance)
  .then(items => Promise.all(
    items.map(item => knex('repertoire_instances')
      .where({ item_id: item.id })
      .del()
      .then(() => knex('exercise_instances')
        .where({ item_id: item.id })
        .del())
    // 3. finally, delete the item supertype
      .then(() => knex('items')
        .where({ id: item.id })
        .del())),
  ));

eventsRouter.delete('/:id', (req, res) => {
  const eventId = req.params.id;
  // 1. delete event subtype first, as it has a foreign key to the main event record
  deleteAnyEventSubtypeRecords(eventId)
    // 2. then delete any notes attached directly to the event
    .then(() => deleteNotesAttachedToEvent(eventId))
    // 3. then delete any items attached to the event
    .then(() => deleteItemsAttachedToEvent(eventId))
    // 4. then delete the event record itself
    .then(() => knex('events')
      .where({ id: eventId })
      .del())
    .then(() => {
      console.log(`Event deleted (id: ${eventId})`);
      res.status(200).json({}); // HTTP 200 expects body - return empty JSON object
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

eventsRouter.post('/:eventId/repertoire', (req, res) => {
  const { eventId } = req.params;
  const { repertoireId } = req.body;
  const type = ITEM_TYPES.PIECE;
  const newItem = {
    type,
    event_id: eventId,
  };
  knex('items')
    .insert([newItem])
    .returning(['id as item_id', 'type', 'event_id'])
    .then(resultArray => resultArray[0])
    .then(item => {
      const newRepertoireItem = {
        repertoire_id: repertoireId,
        item_id: item.item_id,
      };
      return knex('repertoire_instances')
        .insert([newRepertoireItem])
        .returning(['id as repertoire_instance_id', 'repertoire_id', 'item_id'])
        .then(resultArray => resultArray[0])
        .then(repertoireInstance => knex('repertoire') // resolve piece details
          .where({ id: repertoireInstance.repertoire_id })
          .first(
            'name',
            'composer_id',
            'composition_date',
            'larger_work',
            'character_that_sings_it',
          )
          .then(repertoire => ({
            ...repertoire,
            ...repertoireInstance,
          })))
        .then(repertoireInstance => {
          const newRepertoireInstance = { ...repertoireInstance };
          return knex('people')
            .where({ id: repertoireInstance.composer_id })
            .first()
            .then(composer => {
              newRepertoireInstance.composer = composer;
              delete newRepertoireInstance.composer_id;
              return newRepertoireInstance;
            });
        })
        .then(repertoireInstance => ({
          ...item,
          ...repertoireInstance,
        }));
    })
    .then(result => {
      console.log(
        `New repertoire instance added (item_id: ${result.item_id}, repertoire_instance_id: ${
          result.repertoire_instance_id
        })`,
      );
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

eventsRouter.post('/:eventId/exercises', (req, res) => {
  const { eventId } = req.params;
  const { exerciseId } = req.body;
  const type = ITEM_TYPES.EXERCISE;
  const newItem = {
    type,
    event_id: eventId,
  };
  knex('items')
    .insert([newItem])
    .returning(['id as item_id', 'type', 'event_id'])
    .then(resultArray => resultArray[0])
    .then(item => {
      const newExerciseItem = {
        exercise_id: exerciseId,
        item_id: item.item_id,
      };
      return knex('exercise_instances')
        .insert([newExerciseItem])
        .returning(['id as exercise_instance_id', 'exercise_id', 'item_id'])
        .then(resultArray => resultArray[0])
        .then(exerciseInstance => knex('exercises') // resolve exercise details
          .where({ id: exerciseInstance.exercise_id })
          .first(
            'name',
            'score',
            'range_lowest_note',
            'range_highest_note',
            'details',
            'teacher_who_created_it_id',
          )
          .then(exercise => ({
            ...exercise,
            ...exerciseInstance,
          })))
        .then(exerciseInstance => {
          const newExerciseInstance = { ...exerciseInstance };
          return knex('people')
            .where({ id: exerciseInstance.teacher_who_created_it_id })
            .first()
            .then(teacher => {
              newExerciseInstance.teacher_who_created_it = teacher;
              delete newExerciseInstance.teacher_who_created_it_id;
              return newExerciseInstance;
            });
        })
        .then(exerciseInstance => ({
          ...item,
          ...exerciseInstance,
        }));
    })
    .then(result => {
      console.log(
        `New exercise instance added (item_id: ${result.item_id}, exercise_instance_id: ${
          result.exercise_instance_id
        })`,
      );
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

eventsRouter.get('/in_progress', (req, res) => knex('events')
  .whereNull('end')
  .select()
  .then(result => res.status(200).json(result))
  .catch(error => {
    console.warn(error);
    res.status(400).json(error);
  }));

export default eventsRouter;
