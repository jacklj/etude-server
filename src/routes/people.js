import express from 'express';

import knex from '../knex';
import { convertArrayIntoObjectIndexedByIds } from '../helpers';

const router = express.Router();

router.get('/api/people', (req, res) => {
  knex.raw(`
    SELECT
      person_id, first_name, surname, role
    FROM
      people
  `)
    .then(result => result.rows)
    .then(peopleArray => ({
      people: convertArrayIntoObjectIndexedByIds(peopleArray, 'person_id'),
    }))
    .then(normalizedResponse => res.status(200).json(normalizedResponse))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.get('/api/people/teachers', (req, res) => {
  knex.raw(`
    SELECT
      person_id, first_name, surname, role
    FROM
      people
    WHERE
      role='Teacher'
  `)
    .then(result => result.rows)
    .then(teachersArray => ({
      people: convertArrayIntoObjectIndexedByIds(teachersArray, 'person_id'),
    }))
    .then(normalizedResponse => res.status(200).json(normalizedResponse))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
