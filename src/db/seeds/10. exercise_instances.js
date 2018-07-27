import { ITEM_TYPES } from '../../constants';

export const seed = knex => knex('exercise_instances') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      exercise_id: knex('exercises')
        .where({ name: 'Humming 5th scale' })
        .select('id'),
      item_id: knex('items')
        .where({ type: ITEM_TYPES.EXERCISE })
        .first('id'),
    },
  ]);
