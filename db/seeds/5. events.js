const moment = require('moment');
const EVENT_TYPES = require('../../constants.js').EVENT_TYPES;


exports.seed = function(knex, Promise) {
  return knex('events').insert([
    {
      start: moment('25 June 2018 17:00'),
      end: moment('25 June 2018 18:00'),
      type: EVENT_TYPES.LESSON,
      name: 'Alex Ashworth Lesson',
      location_id: knex('locations').where({ name: 'Royal Academy of Music' }).select('id'),
      rating: 5,
    },
    {
      start: moment('28 June 2018 11:00'),
      end: moment('25 June 2018 13:00'),
      type: EVENT_TYPES.MASTERCLASS,
      name: 'Mary Dunleavy Masterclass Lesson',
      location_id: knex('locations').where({ name: 'Neville Mariner Room, St Martin-in-the-Fields' }).select('id'),
      rating: 5,
    },
    {
      start: moment('3 July 2018 14:00'),
      end: moment('3 July 2018 15:15'),
      type: EVENT_TYPES.LESSON,
      name: 'Mary Dunleavy Lesson',
      location_id: knex('locations').where({ name: 'Blüthner Pianos' }).select('id'),
      rating: 4,
    },
  ]);
};
