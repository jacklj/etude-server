import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../constants';
import {
  getEventsTableFields,
  getLessonsTableFields,
} from '../../helpers';

const lessonsRouter = express.Router();
lessonsRouter.use(bodyParser.json());

lessonsRouter.post('/', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.LESSON; // in case not included in request body
  const lessonsRecord = getLessonsTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
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

export default lessonsRouter;
