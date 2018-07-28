exports.up = knex => knex.schema
  .createTable('other_rep_to_work_on', table => {
    // rep you want to work on, that's not tied to a particular event
    table.increments('id').primary();
    table
      .integer('repertoire_id')
      .references('id')
      .inTable('repertoire');
    table.dateTime('deadline');
  });

exports.down = knex => knex.schema
  .dropTable('other_rep_to_work_on');
