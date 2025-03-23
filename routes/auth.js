// File: routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// User Signup
router.post('/signup', async (req, res) => {
  const { password, email, name, enrollment, branch, phone, college } = req.body;
  if (!password || !email) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const uid = uuidv4();
  await pool.query(
    'INSERT INTO users (uid, email, password, name, enrollment, branch, phone, college) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uid, email, hashedPassword, name, enrollment, branch, phone, college]
  );
  res.status(201).json({ message: 'User created successfully' });
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const user = users[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    res.json({
      success: true,
      uid: user.uid,
      email: user.email,
      name: user.name,
      enrollment: user.enrollment,
      branch: user.branch,
      phone: user.phone,
      college: user.college
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

module.exports = router;
