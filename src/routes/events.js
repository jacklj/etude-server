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
              .join('people', 'lessons.teacher_id', 'people.id')
              .first('people.id', 'first_name', 'surname', 'role')
              .then(result => ({
                ...newEvent,
                teacher: result,
              }));
          }
          case EVENT_TYPES.MASTERCLASS: {
            return knex('masterclasses')
              .where({ event_id: newEvent.id })
              .join('people', 'masterclasses.teacher_id', 'people.id')
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
              .first('item_id', 'repertoire_id', 'name', 'composition_date', 'larger_work', 'character_that_sings_it', 'composer_id') // everything but repertoire_instances.id
              .then(repertoireItem => {
                if (repertoireItem) {
                  const newRepertoireItem = Object.assign({}, repertoireItem); // functional
                  newRepertoireItem.type = ITEM_TYPES.PIECE;
                  return knex('people')
                    .where({ id: newRepertoireItem.composer_id })
                    .first()
                    .then(composer => {
                      newRepertoireItem.composer = composer;
                      delete newRepertoireItem.composer_id;
                      return newRepertoireItem;
                    });
                }
                return knex('exercise_instances')
                  .where({ item_id: item.id })
                  .join('exercises', 'exercise_instances.exercise_id', 'exercises.id')
                  .first('exercise_id', 'item_id', 'name', 'score', 'range_lowest_note', 'range_highest_note', 'details', 'teacher_who_created_it_id') // everything but exercise_instances.id
                  .then(exercise => {
                    if (!exercise) {
                      return Promise.resolve(undefined);
                    }
                    const newExercise = Object.assign({}, exercise); // functional
                    newExercise.type = ITEM_TYPES.EXERCISE;
                    return knex('people')
                      .where({ id: newExercise.teacher_who_created_it_id })
                      .first()
                      .then(teacherWhoCreatedIt => {
                        newExercise.teacher_who_created_it = teacherWhoCreatedIt;
                        delete newExercise.teacher_who_created_it_id;
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

router.get('/api/lessons/:id', (req, res) => {
  const eventId = req.params.id;
  knex('events')
    .where({ id: eventId })
    .first()
    .then(event => knex('locations')
      .where({ id: event.location_id })
      .first()
      .then(location => {
        const newEvent = { ...event };
        newEvent.location = location;
        delete newEvent.location_id;
        return newEvent;
      }))
    .then(event => knex('lessons')
      .where({ event_id: event.id })
      .first()
      .then(lesson => knex('people')
        .where({ id: lesson.teacher_id })
        .first()
        .then(teacher => {
          const newLesson = { ...lesson };
          delete newLesson.teacher_id;
          newLesson.teacher = teacher;
          return newLesson;
        }))
      .then(lesson => ({
        event_id: event.id,
        start: event.start,
        end: event.end,
        type: event.type,
        location: event.location,
        rating: event.rating,
        lesson_id: lesson.id,
        teacher: lesson.teacher,
      })))
    .then(lesson => { // get items for this lesson
      const newLesson = { ...lesson }; // functional
      return knex('items')
        .where({ event_id: lesson.event_id })
        .select()
        .then(items => Promise.all(
          items.map(item => knex('repertoire_instances')
            .where({ item_id: item.id })
            .join('repertoire', 'repertoire_instances.repertoire_id', 'repertoire.id')
            .first('item_id', 'repertoire_id', 'name', 'composition_date', 'larger_work', 'character_that_sings_it', 'composer_id') // everything but repertoire_instances.id
            .then(repertoireItem => {
              if (repertoireItem) { // if repertoire item found, resolve the rep
                const newRepertoireItem = Object.assign({}, repertoireItem); // functional
                newRepertoireItem.type = ITEM_TYPES.PIECE;
                return knex('people')
                  .where({ id: newRepertoireItem.composer_id })
                  .first()
                  .then(composer => {
                    newRepertoireItem.composer = composer;
                    delete newRepertoireItem.composer_id;
                    return newRepertoireItem;
                  });
              }
              // else it's an exercise instance - resolve the exercise
              return knex('exercise_instances')
                .where({ item_id: item.id })
                .join('exercises', 'exercise_instances.exercise_id', 'exercises.id')
                .first('exercise_id', 'item_id', 'name', 'score', 'range_lowest_note', 'range_highest_note', 'details', 'teacher_who_created_it_id') // everything but exercise_instances.id
                .then(exercise => {
                  if (!exercise) {
                    return Promise.resolve(undefined);
                  }
                  const newExercise = { ...exercise }; // functional
                  newExercise.type = ITEM_TYPES.EXERCISE;
                  return knex('people') // resolve teacher
                    .where({ id: newExercise.teacher_who_created_it_id })
                    .first()
                    .then(teacherWhoCreatedIt => {
                      newExercise.teacher_who_created_it = teacherWhoCreatedIt;
                      delete newExercise.teacher_who_created_it_id;
                      return newExercise;
                    });
                });
            })),
        ))
        .then(items => {
          if (items.length > 0) {
            newLesson.items = items;
          }
          return newLesson;
        });
    })
    .then(lesson => knex('notes') // get general notes for this lesson
      .where({ event_id: lesson.event_id })
      .select()
      .then(general_notes => ({
        ...lesson,
        general_notes,
      })))
    .then(lesson => res.status(200).json(lesson))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

const getEventsTableFields = (event) => ({
  ...(event.start && { start: event.start }),
  ...(event.end && { end: event.end }),
  ...(event.type && { type: event.type }),
  ...(event.location_id && { location_id: event.location_id }),
  ...(event.rating && { rating: event.rating }),
});

const getLessonsTableFields = (lesson) => ({
  ...(lesson.teacher_id && { teacher_id: lesson.teacher_id }),
});

const getMasterclassesTableFields = getLessonsTableFields;

const getPerformancesTableFields = (performance) => ({
  ...(performance.name && { name: performance.name }),
  ...(performance.details && { details: performance.details }),
  ...(performance.type && { type: performance.type }),
});

router.post('/api/lessons', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.LESSON; // in case not included in request body
  const lessonsRecord = getLessonsTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      lessonsRecord.event_id = result.event_id;
      return knex('lessons')
        .insert([lessonsRecord])
        .returning(['id as lesson_id', 'teacher_id'])
        .then(resultArray => resultArray[0])
        .then(lessonsResult => ({
          ...result,
          ...lessonsResult,
        }));
    })
    .then(result => {
      console.log(`New lesson added (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.put('/api/lessons/:id', (req, res) => {
  const eventId = req.params.id;
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.LESSON; // in case not included in request body
  const lessonsRecord = getLessonsTableFields(req.body);
  knex('events')
    .where({ id: eventId })
    .update(eventsRecord)
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => knex('lessons')
      .where({ event_id: eventId })
      .update(lessonsRecord)
      .returning(['id as lesson_id', 'teacher_id'])
      .then(resultArray => resultArray[0])
      .then(lessonsResult => ({
        ...result,
        ...lessonsResult,
      })))
    .then(result => {
      console.log(`Lesson updated (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.post('/api/masterclasses', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.MASTERCLASS; // in case not included in request body
  const masterclassesRecord = getMasterclassesTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      masterclassesRecord.event_id = result.event_id;
      return knex('masterclasses')
        .insert([masterclassesRecord])
        .returning(['id as masterclass_id', 'teacher_id'])
        .then(resultArray => resultArray[0])
        .then(masterclassesResult => ({
          ...result,
          ...masterclassesResult,
        }));
    })
    .then(result => {
      console.log(`New masterclass added (event_id: ${result.event_id}, masterclass_id: ${result.masterclass_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.post('/api/performances', (req, res) => {
  const eventsRecord = getEventsTableFields(req.body);
  eventsRecord.type = EVENT_TYPES.PERFORMANCE; // overwrite the performance type with
  // this event type, for the event record
  const performancesRecord = getPerformancesTableFields(req.body);
  knex('events')
    .insert([eventsRecord])
    .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      performancesRecord.event_id = result.event_id;
      return knex('performances')
        .insert([performancesRecord])
        .returning(['id as performance_id', 'name', 'details', 'type as performance_type'])
        .then(resultArray => resultArray[0])
        .then(performancesResult => ({
          ...result,
          ...performancesResult,
        }));
    })
    .then(result => {
      console.log(`New performance added (event_id: ${result.event_id}, performance_id: ${result.performance_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.post('/api/practice_sessions', (req, res) => {
  const newEvent = req.body;
  newEvent.type = EVENT_TYPES.PRACTICE;
  knex('events')
    .insert([newEvent])
    .returning(['id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New practice session added (id: ${result.id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

router.post('/api/thoughts', (req, res) => {
  const newEvent = req.body;
  newEvent.type = EVENT_TYPES.THOUGHT;
  knex('events')
    .insert([newEvent])
    .returning(['id', 'start', 'end', 'type', 'location_id', 'rating'])
    .then(resultArray => resultArray[0])
    .then(result => {
      console.log(`New thought added (id: ${result.id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default router;
