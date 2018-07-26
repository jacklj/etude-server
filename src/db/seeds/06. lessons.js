import moment from 'moment';

export const seed = (knex) => knex('lessons') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      event_id: knex('events')
        .where({ start: moment('2018-06-25 17:00:00') })
        .select('id'),
      teacher: knex('people').where({ surname: 'Ashworth' }).select('id'),
    },
    {
      event_id: knex('events')
        .where({ start: moment('2018-07-03 14:00:00') })
        .select('id'),
      teacher: knex('people').where({ surname: 'Dunleavy' }).select('id'),
    },
  ]);
