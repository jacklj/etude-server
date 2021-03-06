import express from 'express';

import knex from '../knex';
import { convertArrayIntoObjectIndexedByIds } from '../services/helpers';

const router = express.Router();

router.get('/api/people', (req, res) => {
  knex.raw(`
    SELECT
      person_id, first_name, surname, role, created_at, updated_at
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
      person_id, first_name, surname, role, created_at, updated_at
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

router.post('/api/people', (req, res) => {
  const newPerson = req.body;
  knex('people')
    .insert([newPerson])
    .returning(['person_id', 'first_name', 'surname', 'role', 'created_at', 'updated_at'])
    .then(resultArray => {
      const normalizedResponse = {
        people: convertArrayIntoObjectIndexedByIds(resultArray, 'person_id'),
      };
      console.log( // eslint-disable-line no-console
        `New person added (person_id: ${resultArray[0].person_id})`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
