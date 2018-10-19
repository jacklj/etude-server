/* eslint-disable import/prefer-default-export */
import moment from 'moment';
import { EVENT_TYPES } from '../../services/constants';

export const seed = (knex) => knex('events') // eslint-disable-line import/prefer-default-export
  .insert([
    {
      start: moment('2018-06-25 17:00:00'),
      end: moment('2018-06-25 18:00:00'),
      type: EVENT_TYPES.LESSON,
      location_id: knex('locations')
        .where({ name: 'Royal Academy of Music' })
        .select('location_id'),
      rating: 5,
    },
    {
      start: moment('2018-06-28 11:00:00'),
      end: moment('2018-06-28 13:00:00'),
      type: EVENT_TYPES.MASTERCLASS,
      location_id: knex('locations')
        .where({ name: 'Neville Mariner Room, St Martin-in-the-Fields' })
        .select('location_id'),
      rating: 5,
    },
    {
      start: moment('2018-07-03 14:00:00'),
      end: moment('2018-07-03 15:15:00'),
      type: EVENT_TYPES.LESSON,
      location_id: knex('locations')
        .where({ name: 'Blüthner Pianos' })
        .select('location_id'),
      rating: 4,
    },
    {
      start: moment('2018-07-05 18:00:00'),
      end: moment('2018-07-05 18:30:00'),
      type: EVENT_TYPES.PRACTICE,
      location_id: knex('locations')
        .where({ name: 'Practice rooms, Glyndebourne' })
        .select('location_id'),
      rating: 3,
    },
    {
      start: moment('2018-11-10 18:00:00'),
      end: moment('2018-11-10 22:30:00'),
      type: EVENT_TYPES.PERFORMANCE,
      location_id: knex('locations')
        .where({ name: 'Garsington Opera' })
        .select('location_id'),
      rating: 4,
    },
  ]);
