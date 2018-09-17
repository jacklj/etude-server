exports.up = knex => knex.schema.raw(`
  ALTER TABLE events
  ADD COLUMN "in_progress" BOOLEAN NOT NULL DEFAULT FALSE;
  create unique index on events ("in_progress")
  where "in_progress" = true;
`);

exports.down = knex => knex.schema.raw(`
  ALTER TABLE events
  DROP COLUMN "in_progress";
`);
