/* eslint-disable import/prefer-default-export */
import moment from 'moment';

export const seed = knex => knex('other_rep_to_work_on')
  .insert([
    {
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('repertoire_id'),
      deadline: moment('2018-08-15'),
    },
  ]);
