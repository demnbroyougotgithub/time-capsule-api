// src/models/capsule.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Use Sequelize instance from index.js

const Capsule = sequelize.define('Capsule', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unlock_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    unlock_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Ensure the unlock code is unique
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,  // Capsules are active by default
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',  // Associate the capsule with a User
            key: 'id',
        },
    },
});

module.exports = Capsule;
