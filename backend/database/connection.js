const { Sequelize } = require('sequelize');
require('dotenv').config();

class Database {
  constructor() {
    if (!Database.instance) {
      this.sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          dialect: 'postgres',
          logging: false, // Set to console.log to see SQL queries
        }
      );
      Database.instance = this;
    }

    return Database.instance;
  }

  getInstance() {
    return this.sequelize;
  }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance.getInstance();
