// File: routes/test.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('../config/database');

/**
 * @route POST /api/test/start-test
 * @desc Start a new test session
 * @access Public
 */
router.post('/start-test', async (req, res) => {
  try {
    const { uid, expiry } = req.body;
    
    if (!uid || !expiry) {
      return res.status(400).json({ error: 'User ID and expiry time are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if user exists
    const [users] = await connection.query(
      'SELECT * FROM users WHERE uid = ?',
      [uid]
    );
    
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user already has an active test
    const currentTime = Date.now();
    const [activeTests] = await connection.query(
      'SELECT * FROM tests WHERE uid = ? AND expiry_time > ?',
      [uid, currentTime]
    );
    
    if (activeTests.length > 0) {
      connection.release();
      return res.status(400).json({ 
        error: 'User already has an active test',
        testId: activeTests[0].tid,
        password: activeTests[0].password
      });
    }
    
    // Check if MCQs exist for this user
    const mcqFilePath = path.join('./mcqs', `${uid}.json`);
    if (!fs.existsSync(mcqFilePath)) {
      connection.release();
      return res.status(404).json({ error: 'No MCQs found for this user. Generate MCQs first.' });
    }
    
    // Read MCQs from file
    const mcqs = JSON.parse(fs.readFileSync(mcqFilePath, 'utf8'));
    
    // Generate test ID and password
    const tid = uuidv4();
    const password = crypto.randomBytes(3).toString('hex');
    
    // Set expiry time
    const expiryTime = currentTime + (parseInt(expiry) * 60 * 1000);
    
    // Store test data in database
    await connection.query(
      'INSERT INTO tests (tid, uid, password, questions, expiry_time) VALUES (?, ?, ?, ?, ?)',
      [tid, uid, password, JSON.stringify(mcqs), expiryTime]
    );
    
    connection.release();
    
    res.json({
      testId: tid,
      password,
      expiryTime
    });
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

/**
 * @route GET /api/test/is-test-active
 * @desc Check if a test is active for a user
 * @access Public
 */
router.get('/is-test-active', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    const currentTime = Date.now();
    
    const [tests] = await connection.query(
      'SELECT * FROM tests WHERE uid = ? AND expiry_time > ?',
      [uid, currentTime]
    );
    
    connection.release();
    
    res.json({ active: tests.length > 0 });
  } catch (error) {
    console.error('Error checking test status:', error);
    res.status(500).json({ error: 'Failed to check test status' });
  }
});

/**
 * @route POST /api/test/join-test
 * @desc Join an active test session
 * @access Public
 */
router.post('/join-test', async (req, res) => {
  try {
    const { testId, password, uid } = req.body;
    
    if (!testId || !password || !uid) {
      return res.status(400).json({ error: 'Test ID, password, and user ID are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if test exists and password is correct
    const [tests] = await connection.query(
      'SELECT * FROM tests WHERE tid = ? AND password = ?',
      [testId, password]
    );
    
    if (tests.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid test ID or password' });
    }
    
    const test = tests[0];
    
    // Check if test is still active
    if (test.expiry_time <= Date.now()) {
      connection.release();
      return res.status(400).json({ error: 'Test has expired' });
    }
    
    // Check if user already joined this test
    const [existingEntries] = await connection.query(
      'SELECT * FROM history WHERE tid = ? AND uid = ?',
      [testId, uid]
    );
    
    if (existingEntries.length === 0) {
      // Create a new history record
      await connection.query(
        'INSERT INTO history (tid, uid, joined) VALUES (?, ?, ?)',
        [testId, uid, true]
      );
    } else {
      // Update the existing record
      await connection.query(
        'UPDATE history SET joined = TRUE, joined_at = CURRENT_TIMESTAMP WHERE tid = ? AND uid = ?',
        [testId, uid]
      );
    }
    
    connection.release();
    
    res.json({
      questions: JSON.parse(test.questions),
      expiryTime: test.expiry_time
    });
  } catch (error) {
    console.error('Error joining test:', error);
    res.status(500).json({ error: 'Failed to join test' });
  }
});

module.exports = router;