import express from 'express';
import knex from '../knex';

const router = express.Router();

router.post('/api/notes', (req, res) => {
  const note = req.body;
  knex('notes')
    .insert([note])
    .returning('*')
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New note added (id: ${result.id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default router;
