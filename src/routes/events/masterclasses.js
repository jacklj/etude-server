import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../constants';
import {
  getEventsTableFields,
  getMasterclassesTableFields,
} from '../../helpers';

const masterclassesRouter = express.Router();
masterclassesRouter.use(bodyParser.json());

masterclassesRouter.post('/', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.MASTERCLASS; // in case not included in request body
  const masterclassesRecord = getMasterclassesTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      masterclassesRecord.event_id = result.event_id;
      return knex('masterclasses')
        .insert([masterclassesRecord])
        .returning(['id as masterclass_id', 'teacher_id'])
        .then(resultArray => resultArray[0])
        .then(masterclassesResult => ({
          ...result,
          ...masterclassesResult,
        }));
    })
    .then(result => {
      console.log(
        `New masterclass added (event_id: ${result.event_id}, masterclass_id: ${
          result.masterclass_id
        })`,
      );
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default masterclassesRouter;
