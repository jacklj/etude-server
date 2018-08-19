import knex from './knex';
import { EVENT_TYPES, ITEM_TYPES } from './constants';

export const convertArrayIntoObjectIndexedByIds = (array, idKey) => {
  const obj = {};
  array.forEach(item => {
    const id = item[idKey];
    obj[id] = item;
  });
  return obj;
};

/* Parameters:
*   - an event
* Returns:
*   - an event with location details inserted
*/
export const getEventLocation = event => {
  const newEvent = { ...event }; // functional
  return knex('locations')
    .where({ id: event.location_id })
    .first()
    .then(location => {
      newEvent.location = location;
      delete newEvent.location_id;
      return newEvent;
    });
};

/* Parameters:
*   - an event
* Returns:
*   - an event with people present inserted
*/
export const getPeopleAtEvent = event => {
  const newEvent = { ...event }; // functional
  return knex('people_at_events')
    .where({ event_id: event.event_id })
    .join('people', 'people_at_events.person_id', 'people.id')
    .select('people.id', 'first_name', 'surname', 'role')
    .then(people => {
      if (people.length > 0) {
        newEvent.people = people;
      }
      return newEvent;
    });
};

/* Parameters:
*   - an event
* Returns:
*   - an event with lesson details inserted; i.e. a lesson
*/
export const getLessonDetails = event => knex('lessons')
  .where({ event_id: event.event_id })
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
    event_id: event.event_id,
    start: event.start,
    end: event.end,
    type: event.type,
    location: event.location,
    rating: event.rating,
    lesson_id: lesson.id,
    teacher: lesson.teacher,
  }));

/* Parameters:
*   - an event
* Returns:
*   - an event with masterclass details inserted; i.e. a masterclass
*/
export const getMasterclassDetails = event => knex('masterclasses')
  .where({ event_id: event.event_id })
  .first('id as masterclass_id', 'teacher_id')
  .then(masterclass => knex('people')
    .where({ id: masterclass.teacher_id })
    .first()
    .then(teacher => {
      const newMasterclass = { ...masterclass };
      delete newMasterclass.teacher_id;
      newMasterclass.teacher = teacher;
      return {
        ...newMasterclass,
        ...event,
      };
    }));

/* Parameters:
*   - an event
* Returns:
*   - an event with performance details inserted; i.e. a performance
*/
export const getPerformanceDetails = event => knex('performances')
  .where({ event_id: event.event_id })
  .first('performances.id as performance_id', 'name', 'details', 'type')
  .then(performance => ({
    ...event,
    ...performance,
  }));

/* Parameters:
*   - an event
* Returns:
*   - an event with subtype details resolved (added)
*/
export const resolveEventSubtype = event => {
  const { type } = event;
  switch (type) {
    case EVENT_TYPES.LESSON:
      return getLessonDetails(event);
    case EVENT_TYPES.MASTERCLASS:
      return getMasterclassDetails(event);
    case EVENT_TYPES.PERFORMANCE:
      return getPerformanceDetails(event);
    default:
      return Promise.resolve(event);
  }
};

  /* Parameters:
  *   - an event
  * Returns:
  *   - an event with its items included (pieces, exercises etc)
  */
export const getEventItems = event => {
  // get items for this lesson
  const newEvent = { ...event }; // functional
  return knex('items')
    .where({ event_id: event.event_id })
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
        newEvent.items = itemsAsObject;
      }
      return newEvent;
    });
};

/* Parameters:
*   - an event
* Returns:
*   - an event with general notes inserted
*/
export const getEventGeneralNotes = event => knex('notes') // get general notes for this lesson
  .where({ event_id: event.event_id })
  .select('id as note_id', 'note', 'score', 'type', 'event_id')
  .then(generalNotes => {
    const generalNotesAsObject = convertArrayIntoObjectIndexedByIds(generalNotes, 'note_id');
    return {
      ...event,
      notes: generalNotesAsObject,
    };
  });

export const getEventsTableFields = event => ({
  ...(event.start && { start: event.start }),
  ...(event.end && { end: event.end }),
  ...(event.type && { type: event.type }),
  ...(event.location_id && { location_id: event.location_id }),
  ...(event.rating && { rating: event.rating }),
});

export const getLessonsTableFields = lesson => ({
  ...(lesson.teacher_id && { teacher_id: lesson.teacher_id }),
});

export const getMasterclassesTableFields = getLessonsTableFields;

export const getPerformancesTableFields = performance => ({
  ...(performance.name && { name: performance.name }),
  ...(performance.details && { details: performance.details }),
  ...(performance.type && { type: performance.type }),
});
