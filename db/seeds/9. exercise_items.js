const ITEM_TYPES = require('../../constants.js').ITEM_TYPES;

exports.seed = function(knex, Promise) {
  return knex('exercise_items').insert([
    {
      exercise_id: knex('exercises').where({ name: 'Humming 5th scale' }).select('id'),
      item_id: knex('items').where({ type: ITEM_TYPES.EXERCISE }).first('id'),
    },
  ]);
};
