
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'singprocess'
    },
    migrations: {
      directory: __dirname + '/db/migrations',
    },
    debug: false,
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL + '?ssl=true',
    migrations: {
      directory: __dirname + '/db/migrations',
    },
  },
};
