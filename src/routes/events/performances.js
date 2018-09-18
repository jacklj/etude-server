import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../constants';
import {
  getEventsTableFields,
  getPerformancesTableFields,
} from '../../helpers';

const performancesRouter = express.Router();
performancesRouter.use(bodyParser.json());

performancesRouter.post('/', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.PERFORMANCE; // overwrite the performance type with
  // this event type, for the event record
  const performancesRecord = getPerformancesTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
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

export default performancesRouter;
