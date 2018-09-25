/* eslint-disable import/prefer-default-export */
import moment from 'moment';

export const seed = (knex) => knex('masterclasses')
  .insert([
    {
      event_id: knex('events')
        .where({ start: moment('2018-06-28 11:00:00') })
        .select('event_id'),
      teacher_id: knex('people')
        .where({ surname: 'Dunleavy' })
        .select('person_id'),
    },
  ]);
