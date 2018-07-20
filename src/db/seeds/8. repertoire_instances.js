import { ITEM_TYPES } from '../../constants';

export const seed = (knex) => knex('repertoire_instances') // eslint-disable-line import/prefer-default-export
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
