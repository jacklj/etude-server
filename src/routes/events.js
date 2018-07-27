import express from 'express';
import bodyParser from 'body-parser';
import knex from '../knex';
import { EVENT_TYPES, ITEM_TYPES } from '../constants';

const router = express.Router();
router.use(bodyParser.json());

router.get('/api/events', (req, res) => {
  // let events;
  knex('events')
    .select()
    .then(events => Promise.all(
      events.map(event => {
        const newEvent = Object.assign({}, event); // functional
        return knex('locations')
          .where({ id: event.location_id })
          .first()
          .then(location => {
            newEvent.location = location;
            delete newEvent.location_id;
            return newEvent;
          });
      }),
    ))
    .then(events => Promise.all(
      // resolve event subtypes
      events.map(event => {
        const newEvent = Object.assign({}, event); // functional
        switch (newEvent.type) {
          case EVENT_TYPES.LESSON: {
            return knex('lessons')
              .where({ event_id: newEvent.id })
              .join('people', 'lessons.teacher', 'people.id')
              .first('people.id', 'first_name', 'surname', 'role')
              .then(result => ({
                ...newEvent,
                teacher: result,
              }));
          }
          case EVENT_TYPES.MASTERCLASS: {
            return knex('masterclasses')
              .where({ event_id: newEvent.id })
              .join('people', 'masterclasses.teacher', 'people.id')
              .first('people.id', 'first_name', 'surname', 'role')
              .then(result => ({
                ...newEvent,
                teacher: result,
              }));
          }
          case EVENT_TYPES.PERFORMANCE: {
            return knex('performances')
              .where({ event_id: newEvent.id })
              .first()
              .then(result => ({
                ...newEvent,
                ...result,
              }));
          }
          default: {
            return Promise.resolve(newEvent);
          }
        }
      }),
    ))
    .then(events => Promise.all(
      events.map(event => {
        const newEvent = Object.assign({}, event); // functional
        return knex('people_at_events')
          .where({ event_id: event.id })
          .join('people', 'people_at_events.person_id', 'people.id')
          .select('people.id', 'first_name', 'surname', 'role')
          .then(people => {
            if (people.length > 0) {
              newEvent.people = people;
            }
            return newEvent;
          });
      }),
    ))
    .then(events => Promise.all(
      events.map(event => {
        const newEvent = Object.assign({}, event); // functional
        return knex('items')
          .where({ event_id: newEvent.id })
          .select()
          .then(items => Promise.all(
            items.map(item => knex('repertoire_instances')
              .where({ item_id: item.id })
              .join('repertoire', 'repertoire_instances.repertoire_id', 'repertoire.id')
              .first()
              .then(repertoireItem => {
                if (repertoireItem) {
                  const newRepertoireItem = Object.assign({}, repertoireItem); // functional
                  newRepertoireItem.type = ITEM_TYPES.PIECE;
                  return knex('people')
                    .where({ id: newRepertoireItem.composer })
                    .first()
                    .then(composer => {
                      newRepertoireItem.composer = composer;
                      return newRepertoireItem;
                    });
                }
                return knex('exercise_instances')
                  .where({ item_id: item.id })
                  .join('exercises', 'exercise_instances.exercise_id', 'exercises.id')
                  .first()
                  .then(exercise => {
                    if (!exercise) {
                      return Promise.resolve(undefined);
                    }
                    const newExercise = Object.assign({}, exercise); // functional
                    newExercise.type = ITEM_TYPES.EXERCISE;
                    return knex('people')
                      .where({ id: newExercise.teacher_who_created_it })
                      .first()
                      .then(teacherWhoCreatedIt => {
                        newExercise.teacher_who_created_it = teacherWhoCreatedIt;
                        return newExercise;
                      });
                  });
              })),
          ))
          .then(items => {
            if (items.length > 0) {
              newEvent.items = items;
            }
            return newEvent;
          });
      }),
    ))
    .then(events => res.status(200).json(events))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

router.post('/api/events', (req, res) => {
  const newEvent = req.body;
  knex('events')
    .insert([newEvent])
    .returning(['id', 'start', 'end', 'type', 'name', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New event added (id: ${result.id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default router;
