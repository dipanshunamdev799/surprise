// File: routes/user.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * @route GET /api/user/get-user-name
 * @desc Get user name
 * @access Public
 */
router.get('/get-user-name', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT name FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.json({ name: null });
    }
    
    res.json({ name: users[0].name || null });
  } catch (error) {
    console.error('Error getting user name:', error);
    res.status(500).json({ error: 'Failed to get user name' });
  }
});

/**
 * @route GET /api/user/get-enrollment
 * @desc Get user enrollment number
 * @access Public
 */
router.get('/get-enrollment', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT enrollment FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.json({ enrollment: null });
    }
    
    res.json({ enrollment: users[0].enrollment || null });
  } catch (error) {
    console.error('Error getting enrollment:', error);
    res.status(500).json({ error: 'Failed to get enrollment' });
  }
});

/**
 * @route GET /api/user/get-branch
 * @desc Get user branch
 * @access Public
 */
router.get('/get-branch', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT branch FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.json({ branch: null });
    }
    
    res.json({ branch: users[0].branch || null });
  } catch (error) {
    console.error('Error getting branch:', error);
    res.status(500).json({ error: 'Failed to get branch' });
  }
});

/**
 * @route GET /api/user/get-phone
 * @desc Get user phone number
 * @access Public
 */
router.get('/get-phone', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT phone FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.json({ phone: null });
    }
    
    res.json({ phone: users[0].phone || null });
  } catch (error) {
    console.error('Error getting phone:', error);
    res.status(500).json({ error: 'Failed to get phone' });
  }
});

/**
 * @route GET /api/user/get-college
 * @desc Get user college
 * @access Public
 */
router.get('/get-college', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT college FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.json({ college: null });
    }
    
    res.json({ college: users[0].college || null });
  } catch (error) {
    console.error('Error getting college:', error);
    res.status(500).json({ error: 'Failed to get college' });
  }
});

/**
 * @route POST /api/user/set-user-name
 * @desc Set user name
 * @access Public
 */
router.post('/set-user-name', async (req, res) => {
  try {
    const { uid, name } = req.body;
    
    if (!uid || !name) {
      return res.status(400).json({ error: 'User ID and name are required' });
    }
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET name = ? WHERE uid = ?',
      [name, uid]
    );
    connection.release();
    
    res.json({ success: true, name });
  } catch (error) {
    console.error('Error setting user name:', error);
    res.status(500).json({ error: 'Failed to set user name' });
  }
});

/**
 * @route POST /api/user/set-enrollment
 * @desc Set user enrollment number
 * @access Public
 */
router.post('/set-enrollment', async (req, res) => {
  try {
    const { uid, enrollment } = req.body;
    
    if (!uid || !enrollment) {
      return res.status(400).json({ error: 'User ID and enrollment are required' });
    }
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET enrollment = ? WHERE uid = ?',
      [enrollment, uid]
    );
    connection.release();
    
    res.json({ success: true, enrollment });
  } catch (error) {
    console.error('Error setting enrollment:', error);
    res.status(500).json({ error: 'Failed to set enrollment' });
  }
});

/**
 * @route POST /api/user/set-branch
 * @desc Set user branch
 * @access Public
 */
router.post('/set-branch', async (req, res) => {
  try {
    const { uid, branch } = req.body;
    
    if (!uid || !branch) {
      return res.status(400).json({ error: 'User ID and branch are required' });
    }
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET branch = ? WHERE uid = ?',
      [branch, uid]
    );
    connection.release();
    
    res.json({ success: true, branch });
  } catch (error) {
    console.error('Error setting branch:', error);
    res.status(500).json({ error: 'Failed to set branch' });
  }
});

/**
 * @route POST /api/user/set-phone
 * @desc Set user phone number
 * @access Public
 */
router.post('/set-phone', async (req, res) => {
  try {
    const { uid, phone } = req.body;
    
    if (!uid || !phone) {
      return res.status(400).json({ error: 'User ID and phone are required' });
    }
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET phone = ? WHERE uid = ?',
      [phone, uid]
    );
    connection.release();
    
    res.json({ success: true, phone });
  } catch (error) {
    console.error('Error setting phone:', error);
    res.status(500).json({ error: 'Failed to set phone' });
  }
});

/**
 * @route POST /api/user/set-college
 * @desc Set user college
 * @access Public
 */
router.post('/set-college', async (req, res) => {
  try {
    const { uid, college } = req.body;
    
    if (!uid || !college) {
      return res.status(400).json({ error: 'User ID and college are required' });
    }
    
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE users SET college = ? WHERE uid = ?',
      [college, uid]
    );
    connection.release();
    
    res.json({ success: true, college });
  } catch (error) {
    console.error('Error setting college:', error);
    res.status(500).json({ error: 'Failed to set college' });
  }
});

module.exports = router;