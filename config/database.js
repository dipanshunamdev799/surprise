// File: config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'surprise_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        enrollment VARCHAR(255),
        branch VARCHAR(255),
        phone VARCHAR(255),
        college VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tests table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tid VARCHAR(255) UNIQUE NOT NULL,
        uid VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        questions JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiry_time BIGINT NOT NULL,
        FOREIGN KEY (uid) REFERENCES users(uid)
      )
    `);

    // Create history table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tid VARCHAR(255) NOT NULL,
        uid VARCHAR(255) NOT NULL,
        joined BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tid) REFERENCES tests(tid),
        FOREIGN KEY (uid) REFERENCES users(uid)
      )
    `);
    
    console.log('Database tables initialized');
    connection.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database when this module is imported
initializeDatabase().catch(console.error);

module.exports = pool;