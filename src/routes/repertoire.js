import express from 'express';
import knex from '../knex';

import { convertArrayIntoObjectIndexedByIds } from '../helpers';

const router = express.Router();

router.get('/api/repertoire', (req, res) => {
  // TODO 25th September 2018 should repertoire endpoint also returns relevant composers?
  // (normalized of course). For now, no, as not many composers so we can separately get
  // all of them
  knex.raw(`
    SELECT
      repertoire_id, name, composer_id, composition_date, larger_work,
      character_that_sings_it
    FROM
      repertoire
  `)
    .then(result => result.rows)
    .then(repertoireArray => ({
      repertoire: convertArrayIntoObjectIndexedByIds(repertoireArray, 'repertoire_id'),
    }))
    .then(normalizedResponse => res.status(200).json(normalizedResponse))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

// We do need this endpoint, in case the upcoming end point is navigated to directly, by url
// Also to make sure we've got the other_rep_to_work_on
router.get('/api/repertoire/upcoming', (req, res) => {
  // 1. get all repertoire_instances in future
  knex.raw(`
    SELECT
      rep_or_exercise_instance_id,
      rep_or_exercise_instances.event_id,
      repertoire_id,
      events.start as deadline
    FROM events
    INNER JOIN rep_or_exercise_instances ON rep_or_exercise_instances.event_id=events.event_id
    WHERE
      events.end > CURRENT_DATE;
  `)
    .then(result => result.rows)
  // knex('rep_or_exercise_instances')
  //   .join('repertoire', 'repertoire_instances.repertoire_id', 'repertoire.id')
  //   .join('items', 'repertoire_instances.item_id', 'items.id')
  //   .select()
  //   .then(repertoireInstances => Promise.all(
  //     repertoireInstances.map(repertoireInstance => {
  //       const newRepertoireInstance = { ...repertoireInstance }; // functional
  //       return knex('events')
  //         .where({ id: repertoireInstance.event_id })
  //         .first()
  //         .then(event => {
  //           newRepertoireInstance.deadline = event.start;
  //           return newRepertoireInstance;
  //         });
  //     }),
  //   ))
  //   .then(repertoireFromEvents => knex('other_rep_to_work_on')
  //     .join('repertoire', 'other_rep_to_work_on.repertoire_id', 'repertoire.id')
  //     .select()
  //     .then(otherRepToWorkOn => ([
  //       ...repertoireFromEvents,
  //       ...otherRepToWorkOn,
  //     ])))
  //   .then(repertoire => Promise.all(
  //     repertoire.map(piece => {
  //       const newPiece = { ...piece }; // functional
  //       return knex('people')
  //         .where({ id: newPiece.composer_id })
  //         .first()
  //         .then(composer => {
  //           newPiece.composer = composer;
  //           delete newPiece.composer_id;
  //           return newPiece;
  //         });
  //     }),
  //   ))
    .then(repertoire => res.status(200).json(repertoire))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
