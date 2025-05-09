const jwt = require('jsonwebtoken');

const generateTestToken = (username = 1) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateTestToken };
