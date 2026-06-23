const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ message: 'Username and 6+ char password required' });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash, name: name?.trim() || '' });
    const token = makeToken(user);

    return res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = makeToken(user);
    return res.json({ token, user: { id: user._id, username: user.username, name: user.name } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select('username name');
  return res.json({ user });
});

router.patch('/me', auth, async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const update = {};

    if (username) update.username = username;
    if (name !== undefined) update.name = name;
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      update.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true, runValidators: true }).select(
      'username name'
    );

    const token = makeToken({ _id: req.user.userId, username: user.username });
    return res.json({ user, token });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Username already taken' });
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
