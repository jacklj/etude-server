/* eslint-disable import/prefer-default-export */

export const seed = (knex) => knex('exercises')
  .insert([
    {
      name: 'Humming 5th scale',
      details: 'down 3rd, up 3rd, down 5th',
      score: `options space=20
      tabstave
      notation=true tablature=false

      notes :q G-F-E-F-G-F-E-D-C/4

      options space=5`,
      range_lowest_note: 'A2',
      range_highest_note: 'E4',
      teacher_who_created_it_id: knex('people')
        .where({ surname: 'Ashworth' })
        .select('person_id'),
    },
    {
      name: "Descending siren on 'oo'",
      details: 'Seamless transitions between registers',
      teacher_who_created_it_id: knex('people')
        .where({ surname: 'Ashworth' })
        .select('person_id'),
    },
    {
      name: "Sticatto thirds on 'oh'",
      details: 'Seamless transitions between registers',
      teacher_who_created_it_id: knex('people')
        .where({ surname: 'Ashworth' })
        .select('person_id'),
    },
  ]);
