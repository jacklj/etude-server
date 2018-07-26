import moment from 'moment';

export const seed = (knex) => knex('masterclasses') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      event_id: knex('events')
        .where({ start: moment('2018-06-28 11:00:00') })
        .select('id'),
      teacher: knex('people').where({ surname: 'Dunleavy' }).select('id'),
    },
  ]);
