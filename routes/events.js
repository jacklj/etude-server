const express = require('express');

const knex = require('../db/knex.js');
const router = express.Router();

router.get('/api/events', function(req, res, next) {
  // let events;
  knex('events')
    .select()
    .then(events => Promise.all(events.map(event => {
      const newEvent = Object.assign({}, event); // keep it functional
      return knex('locations')
        .where({ id: event.location_id})
        .first()
        .then(location => {
          newEvent.location = location;
          return newEvent;
        })
    })))
    // .join('locations', 'events.location_id', 'locations.id')
    // .join('items', 'events.id', 'items.event_id')
    // .join('repertoire_items', 'items.id', 'repertoire_items.item_id')
    // .join('repertoire', 'repertoire_items.repertoire_id', 'repertoire.id')
    // .join('exercise_items', 'items.id', 'exercise_items.item_id')
    // .join('exercises', 'exercise_items.exercise_id', 'exercises.id')
    .then(events => {
      console.log(events)
      return Promise.all(events.map(event => {
        const newEvent = Object.assign({}, event); // keep it functional
        return knex('people_at_events')
          .where({ event_id: event.id })
          .join('people', 'people_at_events.person_id', 'people.id')
          .select('people.id', 'first_name', 'surname', 'role')
          .then(people_at_event => {
            // console.log(people_at_event)
            newEvent.people = people_at_event;
            return newEvent;
          })
        // }))
        // .then()
          .then(newEvent => {
            // console.log(newEvent)
            const repAndExercises = [];
            return knex('items')
            .where({ event_id: newEvent.id })
            .select()
            .then(items => {
              console.log(items)
              return Promise.all(items.map(item => {
                // each item is either a repertoire item or an exercise item
                console.log(item.id)
                return knex('repertoire_items')
                  .where({ item_id: item.id })
                  // .join('repertoire', 'repertoire_items.repertoire_id', 'repertoire.id')
                  .select()
                  .then(repertoire => {
                    if (repertoire) {
                      console.log(repertoire)
                      return repertoire[0];
                    } else {
                      return knex('exercise_items')
                        .where({ item_id: item.id })
                        .join('exercises', 'exercise_items.exercise_id', 'exercises.id')
                        .select()
                        .then(exercise => {
                          // console.log(exercise)
                          return exercise[0]
                        });
                    }
                  })
              }));
            })
            .then(allItems => {
              newEvent.items = allItems;
              return newEvent;
            })
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
