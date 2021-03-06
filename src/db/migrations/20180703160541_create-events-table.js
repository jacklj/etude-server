import {
  EVENT_TYPES, NOTE_TYPES, PERFORMANCE_TYPES, REPERTOIRE_TYPES,
} from '../../services/constants';

exports.up = knex => knex.schema
  .createTable('locations', table => {
    table.increments('location_id').primary();
    table.string('name');
    table.string('address_line_1');
    table.string('address_line_2');
    table.string('address_line_3');
    table.string('town_city');
    table.string('postcode');
    table.string('website');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('events', table => {
    // events are things that will go in the timeline
    // non abstract supertype - e.g. lessons have a subtype, practice doesnt
    table.increments('event_id').primary();
    table.dateTime('start');
    table.dateTime('end');
    table.enu('type', [
      EVENT_TYPES.LESSON,
      EVENT_TYPES.PRACTICE,
      EVENT_TYPES.COACHING,
      EVENT_TYPES.REHEARSAL,
      EVENT_TYPES.CHOIR_REHEARSAL,
      EVENT_TYPES.MASTERCLASS,
      EVENT_TYPES.PERFORMANCE, // covers all gigs
      EVENT_TYPES.THOUGHT,
      EVENT_TYPES.OTHER,
    ]);
    table
      .integer('location_id')
      .references('location_id')
      .inTable('locations');
    table.integer('rating');
    table.boolean('in_progress').notNullable().defaultTo(false);
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .raw(`
    create unique index on events ("in_progress")
    where "in_progress" = true;
  `)
  .createTable('people', table => {
    table.increments('person_id').primary();
    table.string('first_name');
    table.string('surname');
    table.string('role');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('lessons', table => {
    table.increments('lesson_id').primary();
    table
      .integer('event_id')
      .references('event_id')
      .inTable('events');
    table
      .integer('teacher_id')
      .references('person_id')
      .inTable('people');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('masterclasses', table => {
    table.increments('masterclass_id').primary();
    table
      .integer('event_id')
      .references('event_id')
      .inTable('events');
    table
      .integer('teacher_id')
      .references('person_id')
      .inTable('people');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('performances', table => {
    table.increments('performance_id').primary();
    table.string('name');
    table.text('details', 'longtext'); // in case display in public diary
    table.enu('performance_type', [
      PERFORMANCE_TYPES.CONCERT,
      PERFORMANCE_TYPES.OPERA,
      PERFORMANCE_TYPES.RECITAL,
      PERFORMANCE_TYPES.COMPETITION,
      PERFORMANCE_TYPES.AUDITION,
      PERFORMANCE_TYPES.CHOIR_SERVICE,
      PERFORMANCE_TYPES.CHOIR_CONCERT,
    ]);
    table
      .integer('event_id')
      .references('event_id')
      .inTable('events');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('people_at_events', table => {
    // attach people to events
    table.increments('person_at_event_id').primary();
    table
      .integer('event_id')
      .references('event_id')
      .inTable('events')
      .onDelete('cascade');
    table
      .integer('person_id')
      .references('person_id')
      .inTable('people')
      .onDelete('cascade');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('repertoire', table => {
    table.increments('repertoire_id').primary();
    table.string('name');
    table
      .integer('composer_id')
      .references('person_id')
      .inTable('people');
    table.enu('type', [
      REPERTOIRE_TYPES.OPERA.ARIA,
      REPERTOIRE_TYPES.OPERA.RECIT,
      REPERTOIRE_TYPES.OPERA.RECIT_AND_ARIA,
      REPERTOIRE_TYPES.ORATORIO.ARIA,
      REPERTOIRE_TYPES.ORATORIO.RECIT,
      REPERTOIRE_TYPES.ORATORIO.RECIT_AND_ARIA,
      REPERTOIRE_TYPES.CONCERT_ARIA,
      REPERTOIRE_TYPES.SONG,
    ]);
    table.date('composition_date');
    table.string('larger_work');
    table.string('character_that_sings_it');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('exercises', table => {
    table.increments('exercise_id').primary();
    table.string('name');
    table.text('score', 'longtext');
    table.string('range_lowest_note');
    table.string('range_highest_note');
    table.text('details', 'longtext');
    table
      .integer('teacher_who_created_it_id')
      .references('person_id')
      .inTable('people');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .createTable('rep_or_exercise_instances', table => {
    // a piece or exercise, attached to an event
    table.increments('rep_or_exercise_instance_id').primary();
    table
      .integer('event_id')
      .references('event_id')
      .inTable('events');
    table
      .integer('repertoire_id')
      .references('repertoire_id')
      .inTable('repertoire');
    table
      .integer('exercise_id')
      .references('exercise_id')
      .inTable('exercises');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .raw(`
    ALTER TABLE rep_or_exercise_instances
    ADD CHECK((repertoire_id IS NULL) != (exercise_id IS NULL));
  `)
  .createTable('notes', table => {
    table.increments('note_id').primary();
    table.text('note', 'longtext');
    table.text('score', 'longtext');
    table.enu('type', [NOTE_TYPES.TECHNICAL, NOTE_TYPES.INTERPRETATIONAL, NOTE_TYPES.GENERAL]);
    // can attach notes to rep/exercise instances or, more generally, events.
    // Only one of the foreign keys should be set per record - see CHECK below.
    table
      .integer('rep_or_exercise_instance_id')
      .references('rep_or_exercise_instance_id')
      .inTable('rep_or_exercise_instances');
    table
      .integer('event_id')
      .references('event_id')
      .inTable('events');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  .raw(`
    ALTER TABLE notes
    ADD CHECK((rep_or_exercise_instance_id IS NULL) != (event_id IS NULL));
  `)
  .createTable('other_rep_to_work_on', table => {
    // rep you want to work on, that's not tied to a particular event
    table.increments('other_rep_to_work_on_id').primary();
    table
      .integer('repertoire_id')
      .references('repertoire_id')
      .inTable('repertoire');
    table.dateTime('deadline');
    table.specificType('created_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
    table.specificType('updated_at', 'TIMESTAMPTZ').notNullable().defaultTo(knex.raw('now()'));
  })
  // create views!
  .raw(`
    CREATE VIEW events_master AS
    SELECT
      events.event_id,
      events.start,
      events.end,
      events.location_id,
      events.in_progress,
      events.rating,
      events.type,
      events.created_at,
      events.updated_at,
      performances.performance_id,
      performances.name,
      performances.performance_type,
      performances.details,
      lessons.lesson_id,
      masterclasses.masterclass_id,
      CASE
        WHEN lessons.teacher_id IS NOT NULL THEN lessons.teacher_id
        WHEN masterclasses.teacher_id IS NOT NULL THEN masterclasses.teacher_id
        ELSE NULL
      END AS teacher_id
    FROM events
      LEFT JOIN performances ON (events.event_id = performances.event_id)
      LEFT JOIN lessons ON (events.event_id = lessons.event_id)
      LEFT JOIN masterclasses ON (events.event_id = masterclasses.event_id);
  `)
  // create trigger function for setting updated_at on every UPDATE
  .raw(`
    CREATE OR REPLACE FUNCTION trigger_set_updated_at_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)
  // create triggers
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON masterclasses
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON other_rep_to_work_on
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON people_at_events
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON performances
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON rep_or_exercise_instances
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `)
  .raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON repertoire
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_updated_at_timestamp();
  `);

exports.down = knex => knex.schema
  .raw('DROP VIEW events_master;')
  .raw('DROP TRIGGER update_timestamp on events;')
  .raw('DROP TRIGGER update_timestamp on exercises;')
  .raw('DROP TRIGGER update_timestamp on lessons;')
  .raw('DROP TRIGGER update_timestamp on locations;')
  .raw('DROP TRIGGER update_timestamp on masterclasses;')
  .raw('DROP TRIGGER update_timestamp on notes;')
  .raw('DROP TRIGGER update_timestamp on other_rep_to_work_on;')
  .raw('DROP TRIGGER update_timestamp on people;')
  .raw('DROP TRIGGER update_timestamp on people_at_events;')
  .raw('DROP TRIGGER update_timestamp on performances;')
  .raw('DROP TRIGGER update_timestamp on rep_or_exercise_instances;')
  .raw('DROP TRIGGER update_timestamp on repertoire;')
  .raw('DROP FUNCTION trigger_set_updated_at_timestamp();')
  .dropTable('other_rep_to_work_on')
  .dropTable('people_at_events')
  .dropTable('notes')
  .dropTable('rep_or_exercise_instances')
  .dropTable('repertoire')
  .dropTable('exercises')
  .dropTable('lessons')
  .dropTable('masterclasses')
  .dropTable('performances')
  .dropTable('people')
  .dropTable('events')
  .dropTable('locations');
