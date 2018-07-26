import {
  EVENT_TYPES, ITEM_TYPES, NOTE_TYPES, PERFORMANCE_TYPES,
} from '../../constants';

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
  .createTable('events', table => { // events are things that will go in the timeline
    // supertype
    table.increments('id').primary();
    table.dateTime('start');
    table.dateTime('end');
    table.enu('type', [
      EVENT_TYPES.LESSON,
      EVENT_TYPES.PRACTICE,
      EVENT_TYPES.MASTERCLASS,
      EVENT_TYPES.PERFORMANCE, // covers all gigs
      EVENT_TYPES.THOUGHT,
      EVENT_TYPES.OTHER,
    ]);
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
  .createTable('lessons', table => {
    table.increments('id').primary();
    table
      .integer('event_id')
      .references('id')
      .inTable('events');
    table
      .integer('teacher')
      .references('id')
      .inTable('people');
  })
  .createTable('masterclasses', table => {
    table.increments('id').primary();
    table
      .integer('event_id')
      .references('id')
      .inTable('events');
    table
      .integer('teacher')
      .references('id')
      .inTable('people');
  })
  .createTable('performances', table => {
    table.increments('id').primary();
    table.string('name');
    table.text('details', 'longtext'); // in case display in public diary
    table.enu('type', [
      PERFORMANCE_TYPES.CONCERT,
      PERFORMANCE_TYPES.OPERA,
      PERFORMANCE_TYPES.RECITAL,
      PERFORMANCE_TYPES.COMPETITION,
      PERFORMANCE_TYPES.AUDITION,
    ]);
    table
      .integer('event_id')
      .references('id')
      .inTable('events');
  })
  .createTable('people_at_events', table => {
    // attach people to events
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
    // supertype of repertoire instances, exercise instances, thoughts
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
    table.text('score', 'longtext');
    table.enu('type', [NOTE_TYPES.TECHNICAL, NOTE_TYPES.INTERPRETATIONAL, NOTE_TYPES.GENERAL]);
    // can attach notes to items or, more generally, events. Only one of the
    // foreign keys should be populated, per record.
    // trying this implementation (multiple FKs, one table), rather than subtyping
    // notes and having 2 further tables, item_notes and event_notes
    // TODO 16/7/2018 wait and see how convenient this way is.
    table
      .integer('item_id')
      .references('id')
      .inTable('items');
    table
      .integer('event_id')
      .references('id')
      .inTable('events');
  })
// .raw('ALTER TABLE "notes" ADD CONSTRAINT NOT ("item_id" NOT NULL AND "event_id" NOT NULL);')
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
    table.text('score', 'longtext');
    table.string('range_lowest_note');
    table.string('range_highest_note');
    table.text('details', 'longtext');
    table
      .integer('teacher_who_created_it')
      .references('id')
      .inTable('people');
  })
  .createTable('repertoire_instances', table => {
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
  .createTable('exercise_instances', table => {
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
  .dropTable('repertoire_instances')
  .dropTable('repertoire')
  .dropTable('exercise_instances')
  .dropTable('exercises')
  .dropTable('lessons')
  .dropTable('masterclasses')
  .dropTable('performances')
  .dropTable('people')
  .dropTable('items')
  .dropTable('events')
  .dropTable('locations');
