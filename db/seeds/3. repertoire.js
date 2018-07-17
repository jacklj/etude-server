
exports.seed = (knex) => knex('repertoire')
  .insert([
    {
      name: 'Mein Sehnen, mein Wähnen',
      composer: knex('people').where({ surname: 'Korngold' }).select('id'),
      composition_date: '4 December 1920', // this successfully converts to a date
      larger_work: 'Die tote Stadt',
      character_that_sings_it: 'Fritz',
    },
    {
      name: 'Look, through the port comes the moonshine astray!',
      composer: knex('people').where({ surname: 'Britten' }).select('id'),
      composition_date: '1 December 1951',
      larger_work: 'Billy Budd',
      character_that_sings_it: 'Billy Budd',
    },
    {
      name: 'Donne mie la fate a tanti',
      composer: knex('people').where({ surname: 'Mozart' }).select('id'),
      composition_date: '26 January 1790',
      larger_work: 'Così fan tutte',
      character_that_sings_it: 'Gugliermo',
    },
    {
      name: 'O! du mein holder Abendstern',
      composer: knex('people').where({ surname: 'Wagner' }).select('id'),
      composition_date: '19 October 1845',
      larger_work: 'Tannhäuser',
      character_that_sings_it: 'Wolfram',
    },
    {
      name: 'Bella siccome un angelo',
      composer: knex('people').where({ surname: 'Donizetti' }).select('id'),
      composition_date: '3 January 1843',
      larger_work: 'Don Pasquale',
      character_that_sings_it: 'Malatesta',
    },
  ]);
