const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'postgres',
    'postgres',
    'Postgres',
    {
        host: 'localhost',
        port: '5050',
        dialect: 'postgres'
    }
)