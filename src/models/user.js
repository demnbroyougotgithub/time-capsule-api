// src/models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');  // Import the Sequelize instance from db.js

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Ensure username is unique
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = User;  // Export the User model
