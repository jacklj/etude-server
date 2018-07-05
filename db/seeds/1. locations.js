exports.seed = function(knex, Promise) {
  return knex('repertoire').del() // First delete *all* tables in correct order
    .then(() => knex('exercises').del())
    .then(() => knex('people').del())
    .then(() => knex('locations').del())
    .then(() => knex('locations').insert([
      {
        name: 'Royal Academy of Music',
        address_line_1: 'Royal Academy of Music',
        address_line_2: 'Marylebone Rd',
        town_city: 'London',
        postcode: 'NW1 5HT',
        website: 'http://www.ram.ac.uk/',
      },
      {
        name: 'Home',
        address_line_1: '29 Tarbert Walk',
        town_city: 'London',
        postcode: 'E1 0EE',
      },
      {
        name: 'Garsington Opera',
        address_line_1: 'Garsington Opera',
        address_line_2: 'Wormsley Estate',
        address_line_3: 'Buckinghamshire',
        postcode: 'HP14 3YG',
        website: 'http://www.garsingtonopera.org/',
      },
    ]));
};
