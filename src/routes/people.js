import express from 'express';
import knex from '../knex';

const router = express.Router();

router.get('/api/people', (req, res) => {
  knex('people')
    .select()
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.get('/api/people/teachers', (req, res) => {
  knex('people')
    .where({ role: 'Teacher' })
    .select()
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
