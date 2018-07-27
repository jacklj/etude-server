import moment from 'moment';
import { ITEM_TYPES } from '../../constants';

export const seed = knex => knex('exercise_instances') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      exercise_id: knex('exercises')
        .where({ name: 'Humming 5th scale' })
        .select('id'),
      item_id: knex('items')
        .where({
          type: ITEM_TYPES.EXERCISE,
          event_id: knex('events')
            .where({ start: moment('2018-07-03 14:00:00') })
            .select('id'),
        })
        .first('id'),
    },
    {
      exercise_id: knex('exercises')
        .where({ name: "Descending siren on 'oo'" })
        .select('id'),
      item_id: knex('items')
        .where({
          type: ITEM_TYPES.EXERCISE,
          event_id: knex('events')
            .where({ start: moment('2018-07-05 18:00:00') })
            .select('id'),
        })
        .first('id'),
    },
  ]);
