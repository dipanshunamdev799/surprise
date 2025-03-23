// File: routes/mcq.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

// Configure storage for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = './uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Function to generate MCQs from PDF (mock implementation)
const generateMCQs = (pdfPath, uid) => {
  // In a real implementation, you would process the PDF here
  // For this example, we'll create a mock MCQ set
  const mockMCQs = [
    {
      question: "What is Express.js?",
      options: [
        "A front-end framework",
        "A back-end web application framework for Node.js",
        "A database management system",
        "A programming language"
      ],
      correctAnswer: 1
    },
    {
      question: "Which HTTP method is used to request data from a server?",
      options: [
        "POST",
        "PUT",
        "GET",
        "DELETE"
      ],
      correctAnswer: 2
    },
    {
      question: "What does the 'res' object represent in Express.js?",
      options: [
        "Request from the client",
        "Response to the client",
        "Results from database",
        "Runtime Environment Settings"
      ],
      correctAnswer: 1
    }
  ];
  
  // Save generated MCQs to a JSON file
  const mcqsDir = './mcqs';
  if (!fs.existsSync(mcqsDir)) {
    fs.mkdirSync(mcqsDir);
  }
  
  const mcqFilePath = path.join(mcqsDir, `${uid}.json`);
  fs.writeFileSync(mcqFilePath, JSON.stringify(mockMCQs, null, 2));
  
  return mockMCQs;
};

/**
 * @route POST /api/mcq/generate-and-get-mcq
 * @desc Generate MCQs from a PDF document
 * @access Public
 */
router.post('/generate-and-get-mcq', upload.single('document.pdf'), async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }
    
    // Verify that the user exists
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const pdfPath = req.file.path;
    const mcqs = generateMCQs(pdfPath, uid);
    
    res.json(mcqs);
  } catch (error) {
    console.error('Error generating MCQs:', error);
    res.status(500).json({ error: 'Failed to generate MCQs' });
  }
});

/**
 * @route POST /api/mcq/regenerate-question
 * @desc Regenerate a specific MCQ question
 * @access Public
 */
router.post('/regenerate-question', async (req, res) => {
  try {
    const { uid, index } = req.body;
    
    if (!uid || index === undefined) {
      return res.status(400).json({ error: 'User ID and question index are required' });
    }
    
    // Verify that the user exists
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE uid = ?',
      [uid]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const mcqFilePath = path.join('./mcqs', `${uid}.json`);
    
    if (!fs.existsSync(mcqFilePath)) {
      return res.status(404).json({ error: 'MCQs not found for this user' });
    }
    
    // Read the existing MCQs
    const mcqs = JSON.parse(fs.readFileSync(mcqFilePath, 'utf8'));
    
    if (index < 0 || index >= mcqs.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }
    
    // Generate a new question to replace the one at the specified index
    const newQuestion = {
      question: `Updated question ${Date.now()}`,
      options: [
        "New option A",
        "New option B",
        "New option C",
        "New option D"
      ],
      correctAnswer: Math.floor(Math.random() * 4)
    };
    
    mcqs[index] = newQuestion;
    
    // Save the updated MCQs
    fs.writeFileSync(mcqFilePath, JSON.stringify(mcqs, null, 2));

    // If there's an active test, update the questions in the test
    const connection2 = await pool.getConnection();
    await connection2.query(
      'UPDATE tests SET questions = ? WHERE uid = ? AND expiry_time > ?',
      [JSON.stringify(mcqs), uid, Date.now()]
    );
    connection2.release();
    
    res.json(mcqs);
  } catch (error) {
    console.error('Error regenerating question:', error);
    res.status(500).json({ error: 'Failed to regenerate question' });
  }
});

module.exports = router;