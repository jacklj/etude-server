const express = require('express');

const knex = require('../db/knex.js');
const router = express.Router();

router.get('/api/events', function(req, res, next) {
  let events;

  knex('events')
    .join('locations', 'events.location_id', 'locations.id')
    .select()
    .then(result => {
      events = result;
      return Promise.all(events.map(event => {
        const newEvent = Object.assign({}, event); // keep it functional
        return knex('people_at_events')
          .where({ event_id: event.id })
          .join('people', 'people_at_events.person_id', 'people.id')
          .select('people.id', 'first_name', 'surname', 'role')
          .then(people_at_event => {
            newEvent.people = people_at_event;
            return newEvent;
          })
      }))
    })
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

module.exports = router;
