/* eslint-disable import/prefer-default-export */
import moment from 'moment';

import { PERFORMANCE_TYPES } from '../../services/constants';

export const seed = (knex) => knex('performances')
  .insert([
    {
      event_id: knex('events')
        .where({ start: moment('2018-11-10 18:00:00') })
        .select('event_id'),
      name: 'Bordeaux Competition',
      details: 'To follow',
      performance_type: PERFORMANCE_TYPES.COMPETITION,
    },
  ]);
