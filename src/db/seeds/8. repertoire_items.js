const { ITEM_TYPES } = require('../../constants.js');

exports.seed = (knex) => knex('repertoire_items')
  .insert([
    {
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('id'),
      item_id: knex('items')
        .where({ type: ITEM_TYPES.PIECE })
        .first('id'),
    },
  ]);
