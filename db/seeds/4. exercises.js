exports.seed = function(knex, Promise) {
  return knex('exercises').insert([
    {
      name: 'Humming 5th scale',
      details: 'down 3rd, up 3rd, down 5th',
      teacher_who_created_it: knex('people').where({ surname: 'Ashworth' }).select('id'),
    },
    {
      name: "Descending siren on 'oo'",
      details: 'Seamless transitions between registers',
      teacher_who_created_it: knex('people').where({ surname: 'Ashworth' }).select('id'),
    },
    {
      name: "Sticatto thirds on 'oh'",
      details: 'Seamless transitions between registers',
      teacher_who_created_it: knex('people').where({ surname: 'Ashworth' }).select('id'),
    },
  ]);
};
