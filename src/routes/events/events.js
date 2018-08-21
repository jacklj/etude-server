import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES, ITEM_TYPES } from '../../constants';
import {
  convertArrayIntoObjectIndexedByIds,
  getEventItems,
  getEventGeneralNotes,
  getEventLocation,
  getPeopleAtEvent,
  resolveEventSubtype,
  getEventsTableFields,
  getPerformancesTableFields,
} from '../../helpers';
import lessonsRouter from './lessons';
import masterclassesRouter from './masterclasses';

const eventsRouter = express.Router();
eventsRouter.use(bodyParser.json());

eventsRouter.use('/lessons', lessonsRouter);
eventsRouter.use('/masterclasses', masterclassesRouter);

eventsRouter.get('/', (req, res) => {
  knex('events')
    .select('id as event_id', 'start', 'end', 'type', 'location_id', 'rating')
    .then(events => Promise.all(events.map(getEventLocation)))
    .then(events => Promise.all(events.map(resolveEventSubtype)))
    .then(events => Promise.all(events.map(getPeopleAtEvent)))
    .then(events => Promise.all(events.map(getEventItems)))
    .then(events => Promise.all(events.map(getEventGeneralNotes)))
    .then(events => convertArrayIntoObjectIndexedByIds(events, 'event_id'))
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

eventsRouter.get('/:id', (req, res) => {
  const eventId = req.params.id;
  knex('events')
    .where({ id: eventId })
    .first('id as event_id', 'start', 'end', 'type', 'location_id', 'rating')
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

eventsRouter.post('/performances', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.PERFORMANCE; // overwrite the performance type with
  // this event type, for the event record
  const performancesRecord = getPerformancesTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      performancesRecord.event_id = result.event_id;
      return knex('performances')
        .insert([performancesRecord])
        .returning(['id as performance_id', 'name', 'details', 'type as performance_type'])
        .then(resultArray => resultArray[0])
        .then(performancesResult => ({
          ...result,
          ...performancesResult,
        }));
    })
    .then(result => {
      console.log(
        `New performance added (event_id: ${result.event_id}, performance_id: ${
          result.performance_id
        })`,
      );
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

eventsRouter.post('/practice_sessions', (req, res) => {
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

eventsRouter.post('/thoughts', (req, res) => {
  const newEvent = req.body;
  newEvent.type = EVENT_TYPES.THOUGHT;
  knex('events')
    .insert([newEvent])
    .returning(['id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New thought added (id: ${result.id})`);
      res.status(200).json(result);
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
