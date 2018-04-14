
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'singprocess'
    },
    debug: true
  },
  production: {
    client: 'postgresql',
    connection: DATABASE_URL + '?ssl=true'
  }

};
