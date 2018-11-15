import { REPERTOIRE_TYPES } from '../../services/constants';

/* eslint-disable import/prefer-default-export */
export const seed = (knex) => knex('repertoire')
  .insert([
    {
      name: 'Mein Sehnen, mein Wähnen',
      composer_id: knex('people').where({ surname: 'Korngold' }).select('person_id'),
      composition_date: '4 December 1920', // this successfully converts to a date
      larger_work: 'Die tote Stadt',
      character_that_sings_it: 'Fritz',
      type: REPERTOIRE_TYPES.OPERA.ARIA,
    },
    {
      name: 'Look, through the port comes the moonshine astray!',
      composer_id: knex('people').where({ surname: 'Britten' }).select('person_id'),
      composition_date: '1 December 1951',
      larger_work: 'Billy Budd',
      character_that_sings_it: 'Billy Budd',
      type: REPERTOIRE_TYPES.OPERA.ARIA,
    },
    {
      name: 'Donne mie la fate a tanti',
      composer_id: knex('people').where({ surname: 'Mozart' }).select('person_id'),
      composition_date: '26 January 1790',
      larger_work: 'Così fan tutte',
      character_that_sings_it: 'Guglielmo',
      type: REPERTOIRE_TYPES.OPERA.ARIA,
    },
    {
      name: 'O! du mein holder Abendstern',
      composer_id: knex('people').where({ surname: 'Wagner' }).select('person_id'),
      composition_date: '19 October 1845',
      larger_work: 'Tannhäuser',
      character_that_sings_it: 'Wolfram',
      type: REPERTOIRE_TYPES.OPERA.ARIA,
    },
    {
      name: 'Bella siccome un angelo',
      composer_id: knex('people').where({ surname: 'Donizetti' }).select('person_id'),
      composition_date: '3 January 1843',
      larger_work: 'Don Pasquale',
      character_that_sings_it: 'Malatesta',
      type: REPERTOIRE_TYPES.OPERA.ARIA,
    },
  ]);
