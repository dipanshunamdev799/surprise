// File: app.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize database connection
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Storage configuration for uploaded PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configure multer for PDF uploads
const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Ensure necessary directories exist
const mcqsDir = './mcqs';
if (!fs.existsSync(mcqsDir)) {
  fs.mkdirSync(mcqsDir);
}

// In-memory storage for active tests
// In a production app, you'd move this to the database too
const activeTests = {};
const testSessions = {};

// Router imports
const mcqRoutes = require('./routes/mcq');
const testRoutes = require('./routes/test');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/mcq', mcqRoutes);
app.use('/api/test', testRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;