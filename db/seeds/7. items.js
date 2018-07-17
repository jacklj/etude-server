const moment = require('moment');
const { ITEM_TYPES } = require('../../constants.js');

exports.seed = (knex) => knex('items')
  .insert([
    {
      type: ITEM_TYPES.PIECE,
      event_id: knex('events')
        .where({ start: moment('2018-06-25 17:00:00') })
        .select('id'),
    },
    {
      type: ITEM_TYPES.PIECE,
      event_id: knex('events')
        .where({ start: moment('2018-07-03 14:00:00') })
        .select('id'),
    },
    {
      type: ITEM_TYPES.EXERCISE,
      event_id: knex('events')
        .where({ start: moment('2018-07-03 14:00:00') })
        .select('id'),
    },
    {
      type: ITEM_TYPES.EXERCISE,
      event_id: knex('events')
        .where({ start: moment('2018-07-05 18:00:00') })
        .select('id'),
    },
    {
      type: ITEM_TYPES.PIECE,
      event_id: knex('events')
        .where({ start: moment('2018-07-05 18:00:00') })
        .select('id'),
    },
  ]);
