import express from 'express';
import bodyParser from 'body-parser';
import knex from '../../knex';
import { EVENT_TYPES, ITEM_TYPES } from '../../constants';
import {
  convertArrayIntoObjectIndexedByIds,
  getEventsTableFields,
  getLessonsTableFields,
} from '../../helpers';

const lessonsRouter = express.Router();
lessonsRouter.use(bodyParser.json());

lessonsRouter.post('/', (req, res) => {
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
      console.log(
        `New lesson added (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`,
      );
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

lessonsRouter.put('/:id', (req, res) => {
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
    // return full lesson object
    .then(event => knex('locations')
      .where({ id: event.location_id })
      .first()
      .then(location => {
        const newEvent = { ...event };
        newEvent.location = location;
        delete newEvent.location_id;
        return newEvent;
      }))
    .then(lesson => knex('people')
      .where({ id: lesson.teacher_id })
      .first()
      .then(teacher => {
        const newLesson = { ...lesson };
        delete newLesson.teacher_id;
        newLesson.teacher = teacher;
        return newLesson;
      }))
    .then(lesson => {
      // get items for this lesson
      const newLesson = { ...lesson }; // functional
      return knex('items')
        .where({ event_id: lesson.event_id })
        .select()
        .then(items => Promise.all(
          items.map(item => knex('repertoire_instances')
            .where({ item_id: item.id })
            .join('repertoire', 'repertoire_instances.repertoire_id', 'repertoire.id')
            .first(
              'item_id',
              'repertoire_id',
              'name',
              'composition_date',
              'larger_work',
              'character_that_sings_it',
              'composer_id',
            ) // everything but repertoire_instances.id
            .then(repertoireItem => {
              if (repertoireItem) {
                // if repertoire item found, resolve the rep
                const newRepertoireItem = { ...repertoireItem }; // functional
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
                .first(
                  'exercise_id',
                  'item_id',
                  'name',
                  'score',
                  'range_lowest_note',
                  'range_highest_note',
                  'details',
                  'teacher_who_created_it_id',
                ) // everything but exercise_instances.id
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
            const itemsAsObject = convertArrayIntoObjectIndexedByIds(items, 'item_id');
            newLesson.items = itemsAsObject;
          }
          return newLesson;
        });
    })
    .then(lesson => knex('notes') // get general notes for this lesson
      .where({ event_id: lesson.event_id })
      .select('id as note_id', 'note', 'score', 'type', 'event_id')
      .then(generalNotes => {
        const generalNotesAsObject = convertArrayIntoObjectIndexedByIds(generalNotes, 'note_id');
        return {
          ...lesson,
          notes: generalNotesAsObject,
        };
      }))
    .then(result => {
      console.log(`Lesson updated (event_id: ${result.event_id}, lesson_id: ${result.lesson_id})`);
      res.status(200).json(result);
    })
    .catch(error => {
      console.warn(error);
      res.status(400).json(error);
    });
});

export default lessonsRouter;
