import express from 'express';
import knex from '../knex';

const router = express.Router();

router.post('/api/notes', (req, res) => {
  const note = req.body;
  knex('notes')
    .insert([note])
    .returning(['id as note_id', 'note', 'score', 'type', 'event_id', 'item_id'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New note added (id: ${result.note_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.put('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const note = req.body;
  knex('notes')
    .where({ id: noteId })
    .update(note)
    .returning(['id as note_id', 'note', 'score', 'type', 'event_id', 'item_id'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`Note edited (id: ${result.note_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  knex('notes')
    .where({ id: noteId })
    .del()
    .then(() => {
      console.log(`Note deleted (id: ${noteId})`);
      res.status(200).json({}); // HTTP 200 expects body - return empty JSON object
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default router;
