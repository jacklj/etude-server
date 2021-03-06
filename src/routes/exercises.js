import express from 'express';
import knex from '../knex';

import { convertArrayIntoObjectIndexedByIds } from '../services/helpers';

const router = express.Router();

router.get('/api/exercises', (req, res) => {
  const response = {};
  knex('exercises')
    .select()
    .then(exercises => {
      response.exercises = convertArrayIntoObjectIndexedByIds(exercises, 'exercise_id');
    })
    // try getting all relevant people without using the exercises previously got
    // and an IN statement - seems to work! But if we want to only get certain exercises
    // in future, may be easier to do this query once then pass the exercise ids in
    // to subsequent queries using an IN statement
    .then(() => knex.raw(`
      SELECT people.person_id, people.first_name, people.surname, people.role
      FROM people
      INNER JOIN exercises ON exercises.teacher_who_created_it_id=people.person_id;
    `))
    .then(peopleResult => {
      response.people = convertArrayIntoObjectIndexedByIds(peopleResult.rows, 'person_id');
    })
    .then(() => res.status(200).json(response))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.post('/api/exercises', (req, res) => {
  const newExercise = req.body;
  knex('exercises')
    .insert([newExercise])
    .returning([
      'exercise_id',
      'name',
      'score',
      'range_lowest_note',
      'range_highest_note',
      'details',
      'teacher_who_created_it_id',
      'created_at',
      'updated_at',
    ])
    .then(resultArray => {
      const normalizedResponse = {
        exercises: convertArrayIntoObjectIndexedByIds(resultArray, 'exercise_id'),
      };
      console.log(
        // eslint-disable-line no-console
        `New exercise added (repertoire_id: ${resultArray[0].exercise_id})`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
