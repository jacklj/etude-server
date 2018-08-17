import express from 'express';

import knex from '../knex';
import { ITEM_TYPES } from '../constants';

const router = express.Router();

router.delete('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  knex('items')
    .where({ id: itemId })
    .first()
    .then(item => {
      // get the item type first, so we can delete the record from the right subtable
      const { type } = item;
      switch (type) {
        case ITEM_TYPES.PIECE:
          return knex('repertoire_instances')
            .where({ item_id: itemId })
            .del()
        case ITEM_TYPES.EXERCISE:
          return knex('exercise_instances')
            .where({ item_id: itemId })
            .del()
        default:
          return Promise.resolve();
      }
    })
    .then(() => knex('items')
      .where({ id: itemId })
      .del())
    .then(() => {
      console.log(`Item deleted (id: ${itemId})`);
      res.status(200).json({}); // HTTP 200 expects body - return empty JSON object
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default router;
