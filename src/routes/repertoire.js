import express from 'express';
import knex from '../knex';

import { convertArrayIntoObjectIndexedByIds } from '../helpers';

const router = express.Router();

router.get('/api/repertoire', (req, res) => {
  // TODO 25th September 2018 should repertoire endpoint also returns relevant composers?
  // (normalized of course). For now, no, as not many composers so we can separately get
  // all of them
  knex.raw(`
    SELECT
      repertoire_id, name, composer_id, composition_date, larger_work,
      character_that_sings_it
    FROM
      repertoire
  `)
    .then(result => result.rows)
    .then(repertoireArray => ({
      repertoire: convertArrayIntoObjectIndexedByIds(repertoireArray, 'repertoire_id'),
    }))
    .then(normalizedResponse => res.status(200).json(normalizedResponse))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

// We do need this endpoint, in case the upcoming end point is navigated to directly, by url
// Also to make sure we've got the other_rep_to_work_on.
// Trying to do pure queries, no 'IN(...string list...)'
router.get('/api/repertoire/upcoming', (req, res) => {
  const response = {};
  // 1. get all repertoire_instances in future
  knex.raw(`
    SELECT
      rep_or_exercise_instance_id,
      rep_or_exercise_instances.event_id,
      repertoire_id
    FROM events
    INNER JOIN rep_or_exercise_instances ON rep_or_exercise_instances.event_id=events.event_id
    WHERE
      events.end > CURRENT_DATE AND rep_or_exercise_instances.repertoire_id IS NOT NULL;
  `)
    .then(result => {
      const rOeInstances = result.rows;
      response.rep_or_exercise_instances = convertArrayIntoObjectIndexedByIds(rOeInstances, 'rep_or_exercise_instance_id');
    })
    .then(() => knex.raw(`
      SELECT
        repertoire.repertoire_id,
        repertoire.name,
        repertoire.composer_id,
        repertoire.composition_date,
        repertoire.larger_work,
        repertoire.character_that_sings_it
      FROM events
      INNER JOIN rep_or_exercise_instances ON rep_or_exercise_instances.event_id=events.event_id
      INNER JOIN repertoire ON rep_or_exercise_instances.repertoire_id=repertoire.repertoire_id
      WHERE
        events.end > CURRENT_DATE;
    `))
    .then(result => {
      const repertoire = result.rows;
      response.repertoire = convertArrayIntoObjectIndexedByIds(repertoire, 'repertoire_id');
    })
    .then(() => knex.raw(`
      SELECT
        people.person_id,
        people.first_name,
        people.surname,
        people.role
      FROM events
      INNER JOIN rep_or_exercise_instances ON rep_or_exercise_instances.event_id=events.event_id
      INNER JOIN repertoire ON rep_or_exercise_instances.repertoire_id=repertoire.repertoire_id
      INNER JOIN people ON repertoire.composer_id=people.person_id
      WHERE
        events.end > CURRENT_DATE;
    `))
    .then(result => {
      const people = result.rows;
      response.people = convertArrayIntoObjectIndexedByIds(people, 'person_id');
    })
    .then(() => knex.raw(`
      SELECT
        other_rep_to_work_on_id,
        repertoire_id,
        deadline
      FROM other_rep_to_work_on
      WHERE
        deadline > CURRENT_DATE;
    `))
    .then(result => {
      const otherRepToWorkOn = result.rows;
      response.other_rep_to_work_on = convertArrayIntoObjectIndexedByIds(otherRepToWorkOn, 'other_rep_to_work_on_id');
    })
    .then(() => knex.raw(`
      SELECT
        repertoire.repertoire_id,
        repertoire.name,
        repertoire.composer_id,
        repertoire.composition_date,
        repertoire.larger_work,
        repertoire.character_that_sings_it
      FROM other_rep_to_work_on
      INNER JOIN repertoire ON other_rep_to_work_on.repertoire_id=repertoire.repertoire_id
      WHERE other_rep_to_work_on.deadline > CURRENT_DATE;
    `))
    .then(result => {
      const repertoire = result.rows;
      response.repertoire = { // merge rep collected so far with this new rep
        ...response.repertoire,
        ...convertArrayIntoObjectIndexedByIds(repertoire, 'repertoire_id'),
      };
    })
    .then(() => knex.raw(`
      SELECT
        people.person_id,
        people.first_name,
        people.surname,
        people.role
      FROM other_rep_to_work_on
      INNER JOIN repertoire ON other_rep_to_work_on.repertoire_id=repertoire.repertoire_id
      INNER JOIN people ON repertoire.composer_id=people.person_id
      WHERE other_rep_to_work_on.deadline > CURRENT_DATE;
    `))
    .then(result => {
      const people = result.rows;
      response.people = {
        ...response.people,
        ...convertArrayIntoObjectIndexedByIds(people, 'person_id'),
      };
    })
    .then(() => res.status(200).json(response))
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
