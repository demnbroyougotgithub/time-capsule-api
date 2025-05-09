// src/index.js or app.js
const express = require('express');
const sequelize = require('./config/config');
const User = require('./models/user');  // Import the User model
const authRoutes = require('./routes/auth');
const capsuleRoutes = require('./routes/capsules');

const app = express();
app.use(express.json());  // Parse JSON requests

// Use the routes
app.use('/capsules', capsuleRoutes);
app.use('/auth', authRoutes);

// Export the app for use in tests
module.exports = app;

// Sync the database and start the server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(5000, () => {
        console.log('Server running on port 5000');
    });
}).catch((err) => {
    console.error('Failed to sync database:', err);
});
