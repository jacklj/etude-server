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
  // dont return teacher entity, because the user will already have it on the
  // front end
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.LESSON; // in case not included in request body
  const lessonsRecord = getLessonsTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
    .then(resultArray => resultArray[0])
    .then(result => {
      lessonsRecord.event_id = result.event_id;
      return knex('lessons')
        .insert([lessonsRecord])
        .returning(['lesson_id', 'teacher_id'])
        .then(resultArray => resultArray[0])
        .then(lessonsResult => ({
          ...result,
          ...lessonsResult,
        }));
    })
    .then(result => {
      const normalizedResponse = {
        events: {
          [result.event_id]: result,
        },
      };
      console.log( // eslint-disable-line no-console
        `New lesson added (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default lessonsRouter;
