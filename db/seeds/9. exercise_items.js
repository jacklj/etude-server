const { ITEM_TYPES } = require('../../constants.js');

exports.seed = knex => knex('exercise_items').insert([
  {
    exercise_id: knex('exercises')
      .where({ name: 'Humming 5th scale' })
      .select('id'),
    item_id: knex('items')
      .where({ type: ITEM_TYPES.EXERCISE })
      .first('id'),
  },
]);
