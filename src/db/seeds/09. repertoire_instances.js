import moment from 'moment';
import { ITEM_TYPES } from '../../constants';

export const seed = (knex) => knex('repertoire_instances') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('id'),
      item_id: knex('items')
        .where({
          type: ITEM_TYPES.PIECE,
          event_id: knex('events')
            .where({ start: moment('2018-06-25 17:00:00') })
            .select('id'),
        })
        .first('id'),
    },
    {
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('id'),
      item_id: knex('items')
        .where({
          type: ITEM_TYPES.PIECE,
          event_id: knex('events')
            .where({ start: moment('2018-07-03 14:00:00') })
            .select('id'),
        })
        .first('id'),
    },
    {
      repertoire_id: knex('repertoire')
        .where({ name: 'O! du mein holder Abendstern' })
        .select('id'),
      item_id: knex('items')
        .where({
          type: ITEM_TYPES.PIECE,
          event_id: knex('events')
            .where({ start: moment('2018-07-05 18:00:00') })
            .select('id'),
        })
        .first('id'),
    },
  ]);
