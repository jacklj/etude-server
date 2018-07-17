const express = require('express');

const knex = require('../db/knex.js');
const router = express.Router();

router.get('/api/events', function(req, res, next) {
  // let events;
  knex('events')
    .select()
    .then(events => Promise.all(events.map(event => {
      const newEvent = Object.assign({}, event); // functional
      return knex('locations')
        .where({ id: event.location_id})
        .first()
        .then(location => {
          newEvent.location = location;
          return newEvent;
        })
    })))
    .then(events => Promise.all(events.map(event => {
      const newEvent = Object.assign({}, event); // functional
      return knex('people_at_events')
        .where({ event_id: event.id })
        .join('people', 'people_at_events.person_id', 'people.id')
        .select('people.id', 'first_name', 'surname', 'role')
        .then(people_at_event => {
          // console.log(people_at_event)
          newEvent.people = people_at_event;
          return newEvent;
        })
      }))
    )
    .then(events => Promise.all(events.map(event => {
      const newEvent = Object.assign({}, event); // functional
      const repAndExercises = [];
      return knex('items')
        .where({ event_id: newEvent.id })
        .select()
        .then(items => Promise.all(items.map(item => {
          // each item is either a repertoire item or an exercise item
          return knex('repertoire_items')
            .where({ item_id: item.id })
            .join('repertoire', 'repertoire_items.repertoire_id', 'repertoire.id')
            .first()
            .then(repertoireItem => {
              if (repertoireItem) {
                const newRepertoireItem = Object.assign({}, repertoireItem); // functional
                return knex('people')
                  .where({ id: newRepertoireItem.composer })
                  .first()
                  .then(composer => {
                    newRepertoireItem.composer = composer;
                    return newRepertoireItem;
                  });
              } else {
                return knex('exercise_items')
                  .where({ item_id: item.id })
                  .join('exercises', 'exercise_items.exercise_id', 'exercises.id')
                  .first()
                  .then(exercise => {
                    if (!exercise) {
                      return Promise.resolve(undefined);
                    }
                    const newExercise = Object.assign({}, exercise); // functional
                    return knex('people')
                      .where({ id: newExercise.teacher_who_created_it })
                      .first()
                      .then(teacherWhoCreatedIt => {
                        newExercise.teacher_who_created_it = teacherWhoCreatedIt;
                        return newExercise;
                      });
                  })
                }
            });
        })))
        .then(items => {
          newEvent.items = items;
          return newEvent;
        })
      })))
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

module.exports = router;
