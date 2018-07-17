const express = require('express');

const knex = require('../../db/knex.js');
const router = express.Router();

router.get('/api/locations', function(req, res, next) {
  knex('locations')
    .select()
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

module.exports = router;
