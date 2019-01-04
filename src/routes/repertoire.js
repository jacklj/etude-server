import express from 'express';
import knex from '../knex';

import { convertArrayIntoObjectIndexedByIds } from '../services/helpers';

const router = express.Router();

router.get('/api/repertoire', (req, res) => {
  // TODO 25th September 2018 should repertoire endpoint also returns relevant composers?
  // (normalized of course). For now, no, as not many composers so we can separately get
  // all of them
  knex.raw(`
    SELECT
      repertoire_id, name, composer_id, composition_date, larger_work,
      character_that_sings_it, type, created_at, updated_at
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

router.get('/api/repertoire/:id', (req, res) => {
  const repId = req.params.id;
  const response = {};
  knex.raw(`
    SELECT
      repertoire_id, name, composer_id, composition_date, larger_work,
      character_that_sings_it, type, created_at, updated_at
    FROM
      repertoire
    WHERE
      repertoire_id=${repId}
  `)
    .then(result => {
      const repertoireArray = result.rows;
      response.repertoire = convertArrayIntoObjectIndexedByIds(repertoireArray, 'repertoire_id');
    })
    .then(() => knex.raw(`
      SELECT
        people.person_id,
        people.first_name,
        people.surname,
        people.role
      FROM 
        repertoire
      INNER JOIN people ON repertoire.composer_id=people.person_id
      WHERE
        repertoire_id=${repId}
    `))
    .then(result => {
      const people = result.rows;
      response.people = convertArrayIntoObjectIndexedByIds(people, 'person_id');
    })
    .then(() => res.status(200).json(response))
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
  // get all events in future with repertoire attached
  knex.raw(`
    SELECT
      events_master.event_id, start, events_master.end, location_id, in_progress,
      rating, type, performance_id, name, performance_type, details, lesson_id,
      masterclass_id, teacher_id
    FROM events_master
    INNER JOIN rep_or_exercise_instances ON rep_or_exercise_instances.event_id=events_master.event_id
    WHERE events_master.end > CURRENT_DATE AND rep_or_exercise_instances.repertoire_id IS NOT NULL;
  `)
    .then(result => {
      const events = result.rows;
      response.events = convertArrayIntoObjectIndexedByIds(events, 'event_id');
    })
    // then the relevant repOrExerciseInstances
    .then(() => knex.raw(`
      SELECT
        rep_or_exercise_instance_id,
        rep_or_exercise_instances.event_id,
        repertoire_id
      FROM events
      INNER JOIN rep_or_exercise_instances ON rep_or_exercise_instances.event_id=events.event_id
      WHERE
        events.end > CURRENT_DATE AND rep_or_exercise_instances.repertoire_id IS NOT NULL;
    `))
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
        repertoire.character_that_sings_it,
        repertoire.type
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
        repertoire.character_that_sings_it,
        repertoire.type
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

router.post('/api/repertoire', (req, res) => {
  const newRepertoire = req.body;
  knex('repertoire')
    .insert([newRepertoire])
    .returning(['repertoire_id', 'name', 'composer_id', 'composition_date',
      'larger_work', 'character_that_sings_it', 'type', 'created_at', 'updated_at'])
    .then(resultArray => {
      const normalizedResponse = {
        repertoire: convertArrayIntoObjectIndexedByIds(resultArray, 'repertoire_id'),
      };
      console.log( // eslint-disable-line no-console
        `New repertoire added (repertoire_id: ${resultArray[0].repertoire_id})`,
      );
      res.status(200).json(normalizedResponse);
    })
    .catch(error => {
      console.warn(error); // eslint-disable-line no-console
      res.status(400).json(error);
    });
});

export default router;
