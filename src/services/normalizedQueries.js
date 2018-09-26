import _ from 'lodash';

import knex from '../knex';
import {
  convertArrayIntoObjectIndexedByIds,
  generateStringListForSqlQuery,
} from '../helpers';

const getEventsLocations = events => {
  if (_.isEmpty(events)) return Promise.resolve(undefined);
  const locationIds = Object.values(events)
    .filter(event => event.location_id)
    .map(event => event.location_id);
  if (_.isEmpty(locationIds)) return Promise.resolve(undefined);
  const locationsAsString = generateStringListForSqlQuery(locationIds);
  return knex.raw(`
    SELECT
      location_id, name, address_line_1, address_line_2, address_line_3,
      town_city, postcode, website
    FROM
      locations
    WHERE
      location_id IN (${locationsAsString})
  `)
    .then(locations => convertArrayIntoObjectIndexedByIds(locations.rows, 'location_id'));
};

export const getEventsLocationsAndAddToResponse = (events, response) => getEventsLocations(events)
  .then(locationsObject => {
    if (!locationsObject || _.isEmpty(locationsObject)) return;
    response.locations = locationsObject;
  });

const getEventsRepOrExerciseInstances = events => {
  if (_.isEmpty(events)) return Promise.resolve(undefined);
  const eventIdsAsString = Object.values(events)
    .map(event => event.event_id)
    .toString();
  return knex.raw(`
    SELECT
      rep_or_exercise_instance_id, exercise_id, repertoire_id, event_id
    FROM
      rep_or_exercise_instances
    WHERE
      event_id IN (${eventIdsAsString})
  `)
    .then(repOrExerciseInstances => convertArrayIntoObjectIndexedByIds(repOrExerciseInstances.rows, 'rep_or_exercise_instance_id'));
};

export const getEventsRepOrExerciseInstancesAndAddToResponse = (events, response) => getEventsRepOrExerciseInstances(events)
  .then(repOrExerciseInstancesObject => {
    if (!repOrExerciseInstancesObject || _.isEmpty(repOrExerciseInstancesObject)) return;
    response.rep_or_exercise_instances = repOrExerciseInstancesObject;
  });

const getInstancesRepertoire = repOrExerciseInstances => {
  if (_.isEmpty(repOrExerciseInstances)) return Promise.resolve(undefined);
  const repertoireIds = Object.values(repOrExerciseInstances)
    .filter(repOrExerciseInstance => repOrExerciseInstance.repertoire_id)
    .map(repInstance => repInstance.repertoire_id);
  if (_.isEmpty(repertoireIds)) return Promise.resolve(undefined);
  const repertoireIdsAsString = generateStringListForSqlQuery(repertoireIds);
  return knex.raw(`
    SELECT
      repertoire_id, name, composer_id, composition_date, larger_work,
      character_that_sings_it
    FROM
      repertoire
    WHERE
      repertoire_id IN (${repertoireIdsAsString})
  `)
    .then(repertoire => convertArrayIntoObjectIndexedByIds(
      repertoire.rows,
      'repertoire_id',
    ));
};

export const getInstanceRepertoireAndAddToResponse = (repOrExerciseInstances, response) => getInstancesRepertoire(repOrExerciseInstances)
  .then(repertoireObject => {
    if (!repertoireObject || _.isEmpty(repertoireObject)) return;
    response.repertoire = repertoireObject;
  });

const getInstanceExercises = repOrExerciseInstances => {
  if (_.isEmpty(repOrExerciseInstances)) return Promise.resolve(undefined);
  const exerciseIds = Object.values(repOrExerciseInstances)
    .filter(repOrExerciseInstance => repOrExerciseInstance.exercise_id)
    .map(exerciseInstance => exerciseInstance.exercise_id);
  if (_.isEmpty(exerciseIds)) return Promise.resolve(undefined);
  const exerciseIdsAsString = generateStringListForSqlQuery(exerciseIds);
  return knex.raw(`
    SELECT
      exercise_id, name, score, range_lowest_note, range_highest_note,
      details, teacher_who_created_it_id
    FROM
      exercises
    WHERE
      exercise_id IN (${exerciseIdsAsString})
  `)
    .then(exercises => convertArrayIntoObjectIndexedByIds(exercises.rows, 'exercise_id'));
};

export const getInstanceExercisesAndAddToResponse = (repOrExerciseInstances, response) => getInstanceExercises(repOrExerciseInstances)
  .then(exercisesObject => {
    if (!exercisesObject || _.isEmpty(exercisesObject)) return;
    response.exercises = exercisesObject;
  });

const getEventsNotes = events => {
  if (_.isEmpty(events)) return Promise.resolve(undefined);
  const eventIdsAsString = Object.values(events)
    .map(event => event.event_id)
    .toString();
  return knex.raw(`
    SELECT
      note_id, note, score, type, event_id
    FROM
      notes
    WHERE
      event_id IN (${eventIdsAsString})
  `)
    .then(notes => convertArrayIntoObjectIndexedByIds(notes.rows, 'note_id'));
};

export const getEventsNotesAndAddToResponse = (events, response) => getEventsNotes(events)
  .then(notesObject => {
    if (!notesObject || _.isEmpty(notesObject)) return;
    response.notes = notesObject;
  });

const getPeopleAtEvents = events => {
  if (_.isEmpty(events)) return Promise.resolve(undefined);
  const eventIdsAsString = Object.values(events)
    .map(event => event.event_id)
    .toString();
  return knex.raw(`
    SELECT
      person_at_event_id, event_id, person_id
    FROM
      people_at_events
    WHERE
      event_id IN (${eventIdsAsString})
  `)
    .then(dbResponse => convertArrayIntoObjectIndexedByIds(dbResponse.rows, 'person_at_event_id'));
};

export const getPeopleAtEventsAndAddToResponse = (events, response) => getPeopleAtEvents(events)
  .then(peopleAtEventsObject => {
    if (!peopleAtEventsObject || _.isEmpty(peopleAtEventsObject)) return;
    response.people_at_events = peopleAtEventsObject;
  });

const getEventsAndRepertoireAndExercisePeople = response => {
  // people: lesson and masterclass teachers, composers,
  // teacher_who_invented_exercises, people_at_events
  const teacherIds = !_.isEmpty(response.events)
    ? Object.values(response.events).map(event => event.teacher_id) : [];
  const composerIds = !_.isEmpty(response.repertoire)
    ? Object.values(response.repertoire).map(repertoireItem => repertoireItem.composer_id) : [];
  const exerciseDeviserIds = !_.isEmpty(response.exercises)
    ? Object.values(response.exercises).map(exercise => exercise.teacher_who_created_it_id) : [];
  const peopleAtEventsIds = !_.isEmpty(response.people_at_events)
    ? Object.values(response.people_at_events).map(personAtEvent => personAtEvent.person_id) : [];
  const peopleIds = [
    ...teacherIds,
    ...composerIds,
    ...exerciseDeviserIds,
    ...peopleAtEventsIds,
  ];
  if (_.isEmpty(peopleIds)) return Promise.resolve(undefined);
  const peopleIdsAsString = generateStringListForSqlQuery(peopleIds);
  return knex.raw(`
    SELECT
      person_id, first_name, surname, role
    FROM
      people
    WHERE
      person_id IN (${peopleIdsAsString})
  `)
    .then(people => convertArrayIntoObjectIndexedByIds(people.rows, 'person_id'));
};

export const getEventsAndRepertoireAndExercisePeopleAndAddToResponse = response => getEventsAndRepertoireAndExercisePeople(response)
  .then(peopleObject => {
    if (!peopleObject || _.isEmpty(peopleObject)) return;
    response.people = peopleObject;
  });
