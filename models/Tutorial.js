const Sequelize = require('sequelize')
const postgres = require('../database')

const Tutorial = postgres.define('tutorial', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  heading: Sequelize.STRING,
  sections: Sequelize.JSON,
  is_top_level: Sequelize.BOOLEAN,
  top_parent: Sequelize.INTEGER
})

module.exports = Tutorial
