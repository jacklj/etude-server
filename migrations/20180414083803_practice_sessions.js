
exports.up = function(knex, Promise) {
  return knex.schema.createTable('practice_sessions', table => {
    table.increments(); // id serial primary key
    table.string('name');
    table.dateTime('start');
    table.dateTime('end');
    table.text('notes', 'longtext');
    table.integer('rating');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('practice_sessions');
};
