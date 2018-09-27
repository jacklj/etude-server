import express from 'express';
import knex from '../knex';

import { renderCreateNoteLogMessage } from '../services/logging';
import { convertArrayIntoObjectIndexedByIds } from '../helpers';

const router = express.Router();

router.post('/api/notes', (req, res) => {
  const note = req.body;
  knex('notes')
    .insert([note])
    .returning(['note_id', 'note', 'score', 'type', 'event_id', 'rep_or_exercise_instance_id'])
    .then(resultArray => {
      const normalizedResponse = {
        notes: convertArrayIntoObjectIndexedByIds(resultArray, 'note_id'),
      };
      console.log(renderCreateNoteLogMessage(resultArray[0])); // eslint-disable-line no-console
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.put('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const note = req.body;
  knex('notes')
    .where({ note_id: noteId })
    .update(note)
    .returning(['note_id', 'note', 'score', 'type', 'event_id', 'rep_or_exercise_instance_id'])
    .then(resultArray => {
      const normalizedResponse = {
        notes: convertArrayIntoObjectIndexedByIds(resultArray, 'note_id'),
      };
      console.log(`Note edited (id: ${noteId})`); // eslint-disable-line no-console
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  knex('notes')
    .where({ note_id: noteId })
    .del()
    .then(() => {
      console.log(`Note deleted (id: ${noteId})`); // eslint-disable-line no-console
      res.status(200).json({}); // HTTP 200 expects body - return empty JSON object
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
