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
*   - a lesson
* Returns:
*   - a lesson with the relevant teacher object inserted
*/
export const getLessonTeacher = lesson => knex('people')
  .where({ id: lesson.teacher_id })
  .first()
  .then(teacher => {
    const newLesson = { ...lesson };
    delete newLesson.teacher_id;
    newLesson.teacher = teacher;
    return newLesson;
  });

// the same as getLessonTeacher
export const getMasterclassTeacher = getLessonTeacher;

/* Parameters:
*   - an event
* Returns:
*   - an event with lesson details inserted; i.e. a lesson
*/
export const getLessonDetails = event => knex('lessons')
  .where({ event_id: event.event_id })
  .first()
  .then(getLessonTeacher)
  .then(lesson => ({
    ...event,
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
  .first()
  .then(getMasterclassTeacher)
  .then(masterclass => ({
    ...event,
    masterclass_id: masterclass.id,
    teacher: masterclass.teacher,
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

const returnUndefinedIfEmptyObject = obj => {
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return undefined;
  }
  return obj;
};

export const getEventsTableFields = event => returnUndefinedIfEmptyObject({
  ...(event.start && { start: event.start }),
  ...(event.end && { end: event.end }),
  ...(event.type && { type: event.type }),
  ...(event.location_id && { location_id: event.location_id }),
  ...(event.rating && { rating: event.rating }),
});

export const getLessonsTableFields = lesson => returnUndefinedIfEmptyObject({
  ...(lesson.teacher_id && { teacher_id: lesson.teacher_id }),
});

export const getMasterclassesTableFields = getLessonsTableFields;

export const getPerformancesTableFields = performance => returnUndefinedIfEmptyObject({
  ...(performance.name && { name: performance.name }),
  ...(performance.details && { details: performance.details }),
  ...(performance.type && { type: performance.type }),
});

const deleteEventSubtypeRecord = (eventId, subtype) => knex(subtype)
  .where({ event_id: eventId })
  .del();

export const deleteAnyEventSubtypeRecords = eventId => deleteEventSubtypeRecord(eventId, 'lessons')
  .then(() => deleteEventSubtypeRecord(eventId, 'masterclasses'))
  .then(() => deleteEventSubtypeRecord(eventId, 'performances'));

export const makeUpdateEventLogMessage = event => {
  let message = `Event updated (event_id: ${event.event_id}, type: ${event.type}`;
  if (event.lesson_id) {
    message = `${message}, lesson_id: ${event.lesson_id})`;
  } else if (event.masterclass_id) {
    message = `${message}, masterclass_id: ${event.masterclass_id})`;
  } else if (event.performance_id) {
    message = `${message}, performance_id: ${event.performance_id})`;
  } else {
    message = `${message})`;
  }
  return message;
};

// TODO 19th September 2018. Clean up the conditionallyUpdate... functions code
export const conditionallyUpdateEventsRecord = (event, eventId) => {
  if (event) {
    return knex('events')
      .where({ id: eventId })
      .update(event)
      .returning(['id as event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress'])
      .then(resultArray => resultArray[0]);
  }
  // else get the event, because it's going to be an event subtype change, but we still
  // want to return the full event object
  return knex('events')
    .where({ id: eventId })
    .first('id as event_id', 'start', 'end', 'type', 'location_id', 'rating', 'in_progress');
};

export const conditionallyUpdateLessonsRecord = (lesson, event, eventId) => {
  if (lesson) {
    return knex('lessons')
      .where({ event_id: eventId })
      .update(lesson)
      .returning(['id as lesson_id', 'teacher_id'])
      .then(resultArray => resultArray[0])
      .then(lessonsResult => ({
        ...event,
        ...lessonsResult,
      }))
      .then(getLessonTeacher); // resolve lesson teacher id to object
  }
  // else get the lesson, because we must have done an Events table update, but
  // we still want to return the full lesson object
  return knex('lessons')
    .where({ event_id: eventId })
    .first('id as lesson_id', 'teacher_id')
    .then(lessonsResult => ({
      ...event,
      ...lessonsResult,
    }))
    .then(getLessonTeacher); // resolve lesson teacher id to object
};

export const conditionallyUpdateMasterclassRecord = (masterclass, event, eventId) => {
  if (masterclass) {
    return knex('masterclasses')
      .where({ event_id: eventId })
      .update(masterclass)
      .returning(['id as masterclass_id', 'teacher_id'])
      .then(resultArray => resultArray[0])
      .then(masterclassesResult => ({
        ...event,
        ...masterclassesResult,
      }))
      .then(getMasterclassTeacher); // resolve lesson teacher id to object
  }
  // else get the masterclass, because we must have done an Events table update, but
  // we still want to return the full masterclass object
  return knex('masterclasses')
    .where({ event_id: eventId })
    .first('id as masterclass_id', 'teacher_id')
    .then(masterclassesResult => ({
      ...event,
      ...masterclassesResult,
    }))
    .then(getMasterclassTeacher); // resolve lesson teacher id to object
};

export const conditionallyUpdatePerformanceRecord = (performance, event, eventId) => {
  if (performance) {
    return knex('performances')
      .where({ event_id: eventId })
      .update(performance)
      .returning(['id as performance_id', 'name', 'details', 'type as performance_type'])
      .then(resultArray => resultArray[0])
      .then(performancesResult => ({
        ...event,
        ...performancesResult,
      }));
  }
  // else get the performance, because we must have done an Events table update, but
  // we still want to return the full performance object
  return knex('performances')
    .where({ event_id: eventId })
    .first('id as performance_id', 'name', 'details', 'type as performance_type')
    .then(performancesResult => ({
      ...event,
      ...performancesResult,
    }));
};
