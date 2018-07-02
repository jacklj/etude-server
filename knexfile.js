
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'singprocess'
    },
    debug: false
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL + '?ssl=true'
  }

};
