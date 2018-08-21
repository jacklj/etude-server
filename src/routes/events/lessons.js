import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES, ITEM_TYPES } from '../../constants';
import {
  convertArrayIntoObjectIndexedByIds,
  getEventsTableFields,
  getLessonsTableFields,
  getEventLocation,
  getLessonTeacher,
  getEventItems,
  getEventGeneralNotes,
} from '../../helpers';

const lessonsRouter = express.Router();
lessonsRouter.use(bodyParser.json());

lessonsRouter.post('/', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.LESSON; // in case not included in request body
  const lessonsRecord = getLessonsTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      lessonsRecord.event_id = result.event_id;
      return knex('lessons')
        .insert([lessonsRecord])
        .returning(['id as lesson_id', 'teacher_id'])
        .then(resultArray => resultArray[0])
        .then(lessonsResult => ({
          ...result,
          ...lessonsResult,
        }));
    })
    .then(result => {
      console.log(
        `New lesson added (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`,
      );
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

lessonsRouter.put('/:id', (req, res) => {
  const eventId = req.params.id;
  // 1. update event and lesson in db
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.LESSON; // in case not included in request body
  const lessonsRecord = getLessonsTableFields(req.body);
  knex('events')
    .where({ id: eventId })
    .update(eventsRecord)
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => knex('lessons')
      .where({ event_id: eventId })
      .update(lessonsRecord)
      .returning(['id as lesson_id', 'teacher_id'])
      .then(resultArray => resultArray[0])
      .then(lessonsResult => ({
        ...result,
        ...lessonsResult,
      })))
    // 2. return full lesson object
    .then(getEventLocation)
    .then(getLessonTeacher)
    .then(getEventItems)
    .then(getEventGeneralNotes)
    .then(result => {
      console.log(`Lesson updated (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default lessonsRouter;
