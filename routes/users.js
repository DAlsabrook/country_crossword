const express = require('express');
const router = express.Router();

const users = [];

router.post('/', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username or Password is incorrect' });
    }

    // Check for existing user
    const existUser = users.find(user => user.username === username);
    if (existUser) {
        return res.status(409).json({ error: 'Username exists' });
    }

    // adding new user
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

module.exports = router;