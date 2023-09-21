const sequelize = require('./db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    chatId: {type: DataTypes.INTEGER, primaryKey: true, unique: true},
    firstName: {type: DataTypes.STRING},
    lastName: {type: DataTypes.STRING},
    userName: {type: DataTypes.STRING},
})

module.exports = User;