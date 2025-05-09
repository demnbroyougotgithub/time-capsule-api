// src/routes/capsules.test.js
const express = require('express');
const { User } = require('../models/user');
const Capsule = require('../models/capsule');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');  // To generate a unique unlock code

const router = express.Router();

// Middleware to verify JWT and extract user information
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Get the token from the header

    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;  // Attach the user object to the request
        next();
    });
};

// POST /capsules - Create a time-locked message capsule
router.post('/', authenticateJWT, async (req, res) => {
    const { message, unlock_at } = req.body;

    if (!message || !unlock_at) {
        return res.status(400).json({ message: 'Message and unlock time are required' });
    }

    try {
        // Generate a unique unlock code for the capsule
        const unlock_code = uuidv4();

        // Create the capsule associated with the authenticated user
        const newCapsule = await Capsule.create({
            message,
            unlock_at,
            unlock_code,
            user_id: req.user.userId,  // Use the userId from the JWT
        });

        return res.status(201).json({
            id: newCapsule.id,
            unlock_code: newCapsule.unlock_code,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


// GET /capsules/:id - Retrieve a time capsule
router.get('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { code } = req.query;  // Get the unlock code from query parameters

    // Validate the presence of the unlock code
    if (!code) {
        return res.status(401).json({ message: 'Unlock code is required' });
    }

    try {
        // Find the capsule by ID
        const capsule = await Capsule.findOne({ where: { id } });

        // If the capsule doesn't exist, return a 404 error
        if (!capsule) {
            return res.status(404).json({ message: 'Capsule not found' });
        }

        // Check if the current time is less than the unlock_at time
        const currentTime = new Date();
        const unlockTime = new Date(capsule.unlock_at);

        // If the unlock code is invalid
        if (capsule.unlock_code !== code) {
            return res.status(401).json({ message: 'Invalid unlock code' });
        }

        if (currentTime < unlockTime) {
            return res.status(403).json({ message: 'Capsule is locked' });
        }


        // Check if more than 30 days have passed since unlock_at
        const thirtyDaysAfterUnlock = new Date(unlockTime);
        thirtyDaysAfterUnlock.setDate(thirtyDaysAfterUnlock.getDate() + 30);

        if (currentTime > thirtyDaysAfterUnlock) {
            return res.status(410).json({ message: 'Capsule expired and no longer available' });
        }

        // If all checks pass, return the full capsule data
        return res.status(200).json({
            id: capsule.id,
            message: capsule.message,
            unlock_at: capsule.unlock_at,
            unlock_code: capsule.unlock_code,
            user_id: capsule.user_id,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /capsules - List all capsules for the logged-in user with pagination
router.get('/', authenticateJWT, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;  // Get pagination parameters, default to page 1 and limit 10
    const offset = (page - 1) * limit;  // Calculate the offset for pagination

    try {
        // Find all capsules belonging to the logged-in user
        const capsules = await Capsule.findAll({
            where: { user_id: req.user.userId }, // Filter capsules by the authenticated user
            limit: parseInt(limit),  // Limit the number of capsules per page
            offset: parseInt(offset),  // Set the offset based on the current page
            attributes: ['id', 'unlock_at', 'unlock_code', 'user_id'],  // Only return relevant metadata
        });

        // Remove the message for locked capsules
        const capsulesWithMessage = capsules.map((capsule) => {
            const capsuleData = capsule.toJSON();
            const currentTime = new Date();
            const unlockTime = new Date(capsuleData.unlock_at);

            // If the capsule is locked, remove the message
            if (currentTime < unlockTime) {
                delete capsuleData.message;
            }
            return capsuleData;
        });

        // Return the capsules with pagination metadata
        return res.status(200).json({
            page: parseInt(page),
            limit: parseInt(limit),
            total: capsules.length,  // You can modify this to return the total count for pagination
            capsules: capsulesWithMessage,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT /capsules/:id - Update a capsule before it's unlocked using unlock_code
router.put('/:id', authenticateJWT, async (req, res) => {
    const capsuleId = req.params.id;
    const { code } = req.query;
    const { message, unlock_at } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Unlock code is required as query parameter.' });
    }

    try {
        const capsule = await Capsule.findOne({
            where: {
                id: capsuleId,
                user_id: req.user.userId
            }
        });

        if (!capsule) {
            return res.status(404).json({ message: 'Capsule not found.' });
        }

        // Validate unlock code
        if (capsule.unlock_code !== code) {
            return res.status(403).json({ message: 'Invalid unlock code.' });
        }

        // Check if capsule is already unlocked
        const now = new Date();
        if (now >= new Date(capsule.unlock_at)) {
            return res.status(403).json({ message: 'Capsule already unlocked. Cannot update.' });
        }

        // Perform the update
        capsule.message = message;
        capsule.unlock_at = new Date(unlock_at);
        await capsule.save();

        return res.status(200).json({ message: 'Capsule updated successfully.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// DELETE /capsules/:id - Delete capsule before unlock using unlock_code
router.delete('/:id', authenticateJWT, async (req, res) => {
    const capsuleId = req.params.id;
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ message: 'Unlock code is required as query parameter.' });
    }

    try {
        const capsule = await Capsule.findOne({
            where: {
                id: capsuleId,
                user_id: req.user.userId
            }
        });

        if (!capsule) {
            return res.status(404).json({ message: 'Capsule not found.' });
        }

        if (capsule.unlock_code !== code) {
            return res.status(403).json({ message: 'Invalid unlock code.' });
        }

        const now = new Date();
        if (now >= new Date(capsule.unlock_at)) {
            return res.status(403).json({ message: 'Capsule already unlocked. Cannot delete.' });
        }

        await capsule.destroy();
        return res.status(200).json({ message: 'Capsule deleted successfully.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
