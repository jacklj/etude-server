import express from 'express';

import knex from '../knex';
import { convertArrayIntoObjectIndexedByIds } from '../services/helpers';

const router = express.Router();

router.get('/api/locations', (req, res) => {
  knex.raw(`
    SELECT
      location_id, name, address_line_1, address_line_2, address_line_3,
      town_city, postcode, website
    FROM
      locations
    `)
    .then(result => result.rows)
    .then(locationsArray => convertArrayIntoObjectIndexedByIds(locationsArray, 'location_id'))
    .then(locations => res.status(200).json({ locations }))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
