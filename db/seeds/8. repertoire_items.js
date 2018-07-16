const ITEM_TYPES = require('../../constants.js').ITEM_TYPES;

exports.seed = function(knex, Promise) {
  return knex('repertoire_items').insert([
    {
      repertoire_id: knex('repertoire').where({ name: 'Mein Sehnen, mein Wähnen' }).select('id'),
      item_id: knex('items').where({ type: ITEM_TYPES.PIECE }).first('id'),
    },
  ]);
};
