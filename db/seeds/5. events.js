const moment = require('moment');
const EVENT_TYPES = require('../../constants.js').EVENT_TYPES;


exports.seed = function(knex, Promise) {
  return knex('events').insert([
    {
      start: moment('17:00 25 June 2018'),
      end: moment('18:00 25 June 2018'),
      type: EVENT_TYPES.LESSON,
      name: 'Alex Ashworth Lesson',
      location_id: knex('locations').where({ name: 'Royal Academy of Music' }).select('id'),
      rating: 5,
    },
    {
      start: moment('11:00 28 June 2018'),
      end: moment('13:00 25 June 2018'),
      type: EVENT_TYPES.MASTERCLASS,
      name: 'Mary Dunleavy Masterclass Lesson',
      location_id: knex('locations').where({ name: 'Neville Mariner Room, St Martin-in-the-Fields' }).select('id'),
      rating: 5,
    },
    {
      start: moment('14:00 3 July 2018'),
      end: moment('15:15 3 July 2018'),
      type: EVENT_TYPES.LESSON,
      name: 'Mary Dunleavy Lesson',
      location_id: knex('locations').where({ name: 'Blüthner Pianos' }).select('id'),
      rating: 4,
    },
    {
      start: moment('18:00 5 July 2018'),
      end: moment('18:30 5 July 2018'),
      type: EVENT_TYPES.PRACTICE,
      name: 'Practice at Glyndebourne',
      location_id: knex('locations').where({ name: 'Practice rooms, Glyndebourne' }).select('id'),
      rating: 3,
    },
  ]);
};
