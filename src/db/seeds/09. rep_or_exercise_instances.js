/* eslint-disable import/prefer-default-export */
import moment from 'moment';

export const seed = (knex) => knex('rep_or_exercise_instances') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      event_id: knex('events')
        .where({ start: moment('2018-06-25 17:00:00') })
        .select('event_id'),
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('repertoire_id'),
    },
    {
      event_id: knex('events')
        .where({ start: moment('2018-07-03 14:00:00') })
        .select('event_id'),
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('repertoire_id'),
    },
    {
      event_id: knex('events')
        .where({ start: moment('2018-07-03 14:00:00') })
        .select('event_id'),
      repertoire_id: knex('repertoire')
        .where({ name: 'O! du mein holder Abendstern' })
        .select('repertoire_id'),
    },
    {
      event_id: knex('events')
        .where({ start: moment('2018-07-05 18:00:00') })
        .select('event_id'),
      exercise_id: knex('exercises')
        .where({ name: 'Humming 5th scale' })
        .select('exercise_id'),
    },
    {
      event_id: knex('events')
        .where({ start: moment('2018-07-05 18:00:00') })
        .select('event_id'),
      exercise_id: knex('exercises')
        .where({ name: "Descending siren on 'oo'" })
        .select('exercise_id'),
    },
  ]);
