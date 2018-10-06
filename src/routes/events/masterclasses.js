import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../services/constants';
import {
  getEventsTableFields,
  getMasterclassesTableFields,
} from '../../services/helpers';

const masterclassesRouter = express.Router();
masterclassesRouter.use(bodyParser.json());

masterclassesRouter.post('/', (req, res) => {
  // dont return teacher entity, because the user will already have it on the
  // front end
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.MASTERCLASS; // in case not included in request body
  const masterclassesRecord = getMasterclassesTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
    .then(resultArray => resultArray[0])
    .then(result => {
      masterclassesRecord.event_id = result.event_id;
      return knex('masterclasses')
        .insert([masterclassesRecord])
        .returning(['masterclass_id', 'teacher_id'])
        .then(resultArray => resultArray[0])
        .then(masterclassesResult => ({
          ...result,
          ...masterclassesResult,
        }));
    })
    .then(result => {
      const normalizedResponse = {
        events: {
          [result.event_id]: result,
        },
      };
      console.log( // eslint-disable-line no-console
        `New masterclass added (event_id: ${result.event_id}, masterclass_id: ${
          result.masterclass_id
        })`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default masterclassesRouter;
