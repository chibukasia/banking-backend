const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../db/db');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name ,email, password: hashedPassword, balance: 0 });
    const token = jwt.sign({ email: user.email, userId: user._id }, 'gfg_jwt_secret_key', { expiresIn: '3h' });
    res.status(201).json({ message: 'Account created successfully', data: user, token});
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Failed to create account', error: error.toString() });
  }
});

// Log in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, userId: user._id}, 'gfg_jwt_secret_key', { expiresIn: '3h' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log in' });
  }
});

// Log out
router.post('/logout', (req, res) => {
  // Implement logout logic here
});

// Deposit money
router.post('/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(404).json({ message: 'Token not provided' });
    }
    const decodedToken = jwt.verify(token, "gfg_jwt_secret_key");
    const userId = decodedToken.userId
    const user = await User.findById(userId);
    
    user.balance += parseFloat(amount);
    await user.save();
    res.status(200).json({ message: 'Deposit successful', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deposit' });
  }
});

// Withdraw money
router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(404).json({ message: 'Token not provided' });
    }
    const decodedToken = jwt.verify(token, "gfg_jwt_secret_key");
    const userId = decodedToken.userId
    const user = await User.findById(userId);

    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= parseFloat(amount);
    await user.save();
    res.status(200).json({ message: 'Withdrawal successful', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to withdraw' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(404).json({ message: 'Token not provided' });
    }
    const decodedToken = jwt.verify(token, "gfg_jwt_secret_key");
    const userId = decodedToken.userId
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});

module.exports = router;
