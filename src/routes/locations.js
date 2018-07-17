import express from 'express';
import knex from '../knex';

const router = express.Router();

router.get('/api/locations', (req, res) => {
  knex('locations')
    .select()
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
