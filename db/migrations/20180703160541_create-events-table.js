const { EVENT_TYPES } = require('../../constants.js');
const { ITEM_TYPES } = require('../../constants.js');

exports.up = knex => knex.schema
  .createTable('locations', table => {
    table.increments('id').primary();
    table.string('name');
    table.string('address_line_1');
    table.string('address_line_2');
    table.string('address_line_3');
    table.string('town_city');
    table.string('postcode');
    table.string('website');
  })
  .createTable('events', table => {
    table.increments('id').primary();
    table.dateTime('start');
    table.dateTime('end');
    table.enu('type', [
      EVENT_TYPES.LESSON,
      EVENT_TYPES.PRACTICE,
      EVENT_TYPES.MASTERCLASS,
      EVENT_TYPES.CONCERT,
      EVENT_TYPES.OPERA,
      EVENT_TYPES.RECITAL,
      EVENT_TYPES.OTHER,
    ]);
    table.string('name');
    table
      .integer('location_id')
      .references('id')
      .inTable('locations');
    table.integer('rating');
  })
  .createTable('people', table => {
    table.increments('id').primary();
    table.string('first_name');
    table.string('surname');
    table.string('role');
  })
  .createTable('people_at_events', table => {
    table.increments('id').primary();
    table
      .integer('event_id')
      .references('id')
      .inTable('events')
      .onDelete('cascade');
    table
      .integer('person_id')
      .references('id')
      .inTable('people')
      .onDelete('cascade');
  })
  .createTable('items', table => {
    // eg a piece of repertoire, an exercise, etc
    table.increments('id').primary();
    table.enu('type', [
      ITEM_TYPES.PIECE,
      ITEM_TYPES.EXERCISE,
      ITEM_TYPES.THOUGHT,
      ITEM_TYPES.PHYSICAL_EXERCISE,
      ITEM_TYPES.GENERAL,
      ITEM_TYPES.OTHER,
    ]);
    table
      .integer('event_id')
      .references('id')
      .inTable('events');
  })
  .createTable('notes', table => {
    table.increments('id').primary();
    table.text('note', 'longtext');
    table
      .integer('item_id')
      .references('id')
      .inTable('items');
  })
  .createTable('repertoire', table => {
    table.increments('id').primary();
    table.string('name');
    table
      .integer('composer')
      .references('id')
      .inTable('people');
    table.date('composition_date');
    table.string('larger_work');
    table.string('character_that_sings_it');
  })
  .createTable('exercises', table => {
    table.increments('id').primary();
    table.string('name');
    table.text('details', 'longtext');
    table
      .integer('teacher_who_created_it')
      .references('id')
      .inTable('people');
  })
  .createTable('repertoire_items', table => {
    table.increments('id').primary();
    table
      .integer('repertoire_id')
      .references('id')
      .inTable('repertoire');
    table
      .integer('item_id')
      .references('id')
      .inTable('items');
  })
  .createTable('exercise_items', table => {
    table.increments('id').primary();
    table
      .integer('exercise_id')
      .references('id')
      .inTable('exercises');
    table
      .integer('item_id')
      .references('id')
      .inTable('items');
  });

exports.down = knex => knex.schema
  .dropTable('people_at_events')
  .dropTable('notes')
  .dropTable('repertoire_items')
  .dropTable('repertoire')
  .dropTable('exercise_items')
  .dropTable('exercises')
  .dropTable('people')
  .dropTable('items')
  .dropTable('events')
  .dropTable('locations');
