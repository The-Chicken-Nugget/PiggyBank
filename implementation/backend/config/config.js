require('dotenv').config();
module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',   // ⬅️  CLI & code will read process.env.DATABASE_URL
    dialect: 'postgres'
  },

  test: {
    dialect: 'sqlite',             // in-memory DB = no external service
    storage: ':memory:',
    logging: false
  }

};
