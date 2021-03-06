/* eslint-disable import/prefer-default-export */
export const seed = (knex) => knex('people')
  .insert([
    {
      first_name: 'Alex',
      surname: 'Ashworth',
      role: 'Teacher',
    },
    {
      first_name: 'Robert',
      surname: 'Dean',
      role: 'Teacher',
    },
    {
      first_name: 'Mary',
      surname: 'Dunleavy',
      role: 'Teacher',
    },
    {
      first_name: 'Susie',
      surname: 'Stranders',
      role: 'Coach',
    },
    {
      first_name: 'Wolfgang Amadeus',
      surname: 'Mozart',
      role: 'Composer',
    },
    {
      first_name: 'Eric',
      surname: 'Korngold',
      role: 'Composer',
    },
    {
      first_name: 'Richard',
      surname: 'Wagner',
      role: 'Composer',
    },
    {
      first_name: 'Gaetano',
      surname: 'Donizetti',
      role: 'Composer',
    },
    {
      first_name: 'Benjamin',
      surname: 'Britten',
      role: 'Composer',
    },
  ]);
