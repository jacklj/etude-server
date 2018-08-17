import express from 'express';
import knex from '../knex';

const router = express.Router();

router.get('/api/repertoire', (req, res) => {
  knex('repertoire')
    .select()
    .then(repertoire => Promise.all(
      repertoire.map(piece => {
        const newPiece = { ...piece };
        return knex('people')
          .where({ id: newPiece.composer_id })
          .first()
          .then(composer => {
            newPiece.composer = composer;
            delete newPiece.composer_id;
            return newPiece;
          });
      }),
    ))
    .then(repertoire => res.status(200).json(repertoire))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.get('/api/repertoire/upcoming', (req, res) => {
  knex('repertoire_instances')
    .join('repertoire', 'repertoire_instances.repertoire_id', 'repertoire.id')
    .join('items', 'repertoire_instances.item_id', 'items.id')
    .select()
    .then(repertoireInstances => Promise.all(
      repertoireInstances.map(repertoireInstance => {
        const newRepertoireInstance = Object.assign({}, repertoireInstance); // functional
        return knex('events')
          .where({ id: repertoireInstance.event_id })
          .first()
          .then(event => {
            newRepertoireInstance.deadline = event.start;
            return newRepertoireInstance;
          });
      }),
    ))
    .then(repertoireFromEvents => knex('other_rep_to_work_on')
      .join('repertoire', 'other_rep_to_work_on.repertoire_id', 'repertoire.id')
      .select()
      .then(otherRepToWorkOn => ([
        ...repertoireFromEvents,
        ...otherRepToWorkOn,
      ])))
    .then(repertoire => Promise.all(
      repertoire.map(piece => {
        const newPiece = Object.assign({}, piece); // functional
        return knex('people')
          .where({ id: newPiece.composer_id })
          .first()
          .then(composer => {
            newPiece.composer = composer;
            delete newPiece.composer_id;
            return newPiece;
          });
      }),
    ))
    .then(repertoire => res.status(200).json(repertoire))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
