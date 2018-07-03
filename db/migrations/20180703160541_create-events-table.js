
exports.up = function(knex, Promise) {
  return knex.schema
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
      table.enu('type', ['Lesson', 'Practice', 'Masterclass', 'Concert', 'Opera', 'Recital', 'Other']);
      table.string('name');
      table.integer('location_id').references('id').inTable('locations');
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
      table.integer('event_id').references('id').inTable('events').onDelete('cascade');
      table.integer('person_id').references('id').inTable('people').onDelete('cascade');
    })
    .createTable('items', table => { // eg a piece of repertoire, an exercise, etc
      table.increments('id').primary();
      table.enu('type', ['Piece', 'Exercise', 'Thought', 'Physical Exercise', 'General', 'Other']);
      table.integer('event_id').references('id').inTable('events');
    })
    .createTable('notes', table => {
      table.increments('id').primary();
      table.text('note', 'longtext');
      table.integer('item_id').references('id').inTable('items');
    })
    .createTable('repertoire', table => {
      table.increments('id').primary();
      table.string('name');
      table.integer('composer').references('id').inTable('people');
      table.date('composition_date');
      table.string('larger_work');
      table.string('character_that_sings_it');
    })
    .createTable('exercises', table => {
      table.increments('id').primary();
      table.string('name');
      table.text('details', 'longtext');
    })
    .createTable('repertoire_item', table => {
      table.increments('id').primary();
      table.integer('repertoire_id').references('id').inTable('repertoire');
      table.integer('item_id').references('id').inTable('items');
    })
    .createTable('exercise_item', table => {
      table.increments('id').primary();
      table.integer('exercise_id').references('id').inTable('exercises');
      table.integer('item_id').references('id').inTable('items');
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('people_at_events')
    .dropTable('notes')
    .dropTable('repertoire_item')
    .dropTable('repertoire')
    .dropTable('exercise_item')
    .dropTable('exercises')
    .dropTable('people')
    .dropTable('items')
    .dropTable('events')
    .dropTable('locations');
};
