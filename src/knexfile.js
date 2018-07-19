export const development = { // export like this for knex cli
  client: 'postgresql',
  connection: {
    database: 'singprocess',
  },
  migrations: {
    directory: `${__dirname}/db/migrations`,
  },
  seeds: {
    directory: `${__dirname}/db/seeds`,
  },
  debug: false,
};

export const production = { // export like this for knex cli
  client: 'postgresql',
  connection: `${process.env.DATABASE_URL}?ssl=true`,
  migrations: {
    directory: `${__dirname}/db/migrations`,
  },
  seeds: {
    directory: `${__dirname}/db/seeds`,
  },
};

export default { // export like this for const config = knexfile[env];
  development,
  production,
};
