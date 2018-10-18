import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../services/constants';
import {
  getEventsTableFields,
  getPerformancesTableFields,
} from '../../services/helpers';

const performancesRouter = express.Router();
performancesRouter.use(bodyParser.json());

performancesRouter.post('/', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body) || {}; // in case body has no event details
  eventsRecord.type = EVENT_TYPES.PERFORMANCE; // overwrite the performance type with
  // this event type, for the event record
  const performancesRecord = getPerformancesTableFields(req.body) || {};
  // in case body has no performance details
  knex('events')
    .insert([eventsRecord])
    .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress', 'created_at', 'updated_at'])
    .then(resultArray => resultArray[0])
    .then(result => {
      performancesRecord.event_id = result.event_id;
      return knex('performances')
        .insert([performancesRecord])
        .returning(['performance_id', 'name', 'details', 'type as performance_type'])
        .then(resultArray => resultArray[0])
        .then(performancesResult => ({
          ...result,
          ...performancesResult,
        }));
    })
    .then(result => {
      const normalizedResponse = {
        events: {
          [result.event_id]: result,
        },
      };
      console.log( // eslint-disable-line no-console
        `New performance added (event_id: ${result.event_id}, performance_id: ${
          result.performance_id
        })`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default performancesRouter;
