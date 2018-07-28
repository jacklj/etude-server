import moment from 'moment';

export const seed = knex => knex('other_rep_to_work_on') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      repertoire_id: knex('repertoire')
        .where({ name: 'Mein Sehnen, mein Wähnen' })
        .select('id'),
      deadline: moment('2018-08-15'),
    },
  ]);
