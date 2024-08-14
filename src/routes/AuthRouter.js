const express = require('express');
const router = express.Router();
const { createToken } = require('../security/jwtUtils');
const UserService = require('../services/UserService');
const authMiddleware = require('../security/authMiddleware');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserService.createUser(username, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserService.getUserByUsername(username);
        if (!user || !(await user.verifyPassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = createToken({ id: user.id, username: user.username });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;

