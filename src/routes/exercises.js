import express from 'express';
import knex from '../knex';

const router = express.Router();

router.get('/api/exercises', (req, res) => {
  knex('exercises')
    .select()
    .then(exercises => Promise.all(
      exercises.map(exercise => {
        const newExercise = { ...exercise };
        return knex('people')
          .where({ id: exercise.teacher_who_created_it_id })
          .first()
          .then(teacher => {
            newExercise.teacher_who_created_it = teacher;
            delete newExercise.teacher_who_created_it_id;
            return newExercise;
          });
      }),
    ))
    .then(exercises => res.status(200).json(exercises))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
