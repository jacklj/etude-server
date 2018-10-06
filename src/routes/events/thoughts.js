import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES } from '../../services/constants';

const thoughtsRouter = express.Router();
thoughtsRouter.use(bodyParser.json());

thoughtsRouter.post('/', (req, res) => {
  const newEvent = req.body;
  newEvent.type = EVENT_TYPES.THOUGHT;
  knex('events')
    .insert([newEvent])
    .returning(['event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
    .then(resultArray => resultArray[0])
    .then(result => {
      const normalizedResponse = {
        events: {
          [result.event_id]: result,
        },
      };
      console.log(`New thought added (id: ${result.event_id})`); // eslint-disable-line no-console
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default thoughtsRouter;
