import express from 'express';

import knex from '../knex';

const router = express.Router();

router.delete('/api/rep_or_exercise_instances/:id', (req, res) => {
  // but you'll lose the link between notes and repertoire or exercises
  const repOrExerciseInstanceId = req.params.id;
  knex.raw(`
    DELETE FROM rep_or_exercise_instances
    WHERE rep_or_exercise_instance_id=${repOrExerciseInstanceId};
  `)
    .then(() => {
      console.log(`Item deleted (id: ${repOrExerciseInstanceId})`); // eslint-disable-line no-console
      res.status(200).json({}); // HTTP 200 expects body - return empty JSON object
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
