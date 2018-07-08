const moment = require('moment');

exports.seed = function(knex, Promise) {
  return knex('people_at_events').insert([
    {
      event_id: knex('events').where({ start: moment('2018-06-25 17:00:00') }).select('id'),
      person_id: knex('people').where({ surname: 'Ashworth' }).select('id'),
    },
    {
      event_id: knex('events').where({ start: moment('2018-06-28 11:00:00') }).select('id'),
      person_id: knex('people').where({ surname: 'Dunleavy' }).select('id'),
    },
    {
      event_id: knex('events').where({ start: moment('2018-07-03 14:00:00') }).select('id'),
      person_id: knex('people').where({ surname: 'Dunleavy' }).select('id'),
    },
  ]);
};
