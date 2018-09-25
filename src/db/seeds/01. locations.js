/* eslint-disable import/prefer-default-export */
// First delete *all* tables in correct order
export const seed = (knex) => knex('other_rep_to_work_on').del()
  .then(() => knex('notes').del())
  .then(() => knex('rep_or_exercise_instances').del())
  .then(() => knex('repertoire').del())
  .then(() => knex('exercises').del())
  .then(() => knex('people_at_events').del())
  .then(() => knex('lessons').del())
  .then(() => knex('masterclasses').del())
  .then(() => knex('performances').del())
  .then(() => knex('people').del())
  .then(() => knex('rep_or_exercise_instances').del())
  .then(() => knex('events').del())
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
      name: 'Neville Mariner Room, St Martin-in-the-Fields',
      address_line_1: 'St Martin-in-the-Fields',
      address_line_2: 'Trafalgar Square',
      town_city: 'London',
      postcode: 'WC2N 4JJ',
      website: 'http://www.stmartin-in-the-fields.org/',
    },
    {
      name: 'Blüthner Pianos',
      address_line_1: 'Blüthner Pianos',
      address_line_2: '6 Baker Street',
      address_line_3: 'Marylebone',
      town_city: 'London',
      postcode: 'W1U 3AA',
      website: 'http://www.bluthner.co.uk/',
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
    {
      name: 'Practice rooms, Glyndebourne',
      address_line_1: 'Glyndebourne',
      address_line_2: 'Lewes',
      address_line_3: 'East Sussex',
      postcode: 'BN8 5UU',
      website: 'http://www.glyndebourne.com/',
    },
  ]));
