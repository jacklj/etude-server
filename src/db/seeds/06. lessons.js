/* eslint-disable import/prefer-default-export */
import moment from 'moment';

export const seed = (knex) => knex('lessons')
  .insert([
    {
      event_id: knex('events')
        .where({ start: moment('2018-06-25 17:00:00') })
        .select('event_id'),
      teacher_id: knex('people')
        .where({ surname: 'Ashworth' })
        .select('person_id'),
    },
    {
      event_id: knex('events')
        .where({ start: moment('2018-07-03 14:00:00') })
        .select('event_id'),
      teacher_id: knex('people')
        .where({ surname: 'Dunleavy' })
        .select('person_id'),
    },
  ]);
