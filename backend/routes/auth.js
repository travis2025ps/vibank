// In main_backend/routes/auth.js

const express = require('express');
const router = express.Router();

// --- THIS IS THE FIX ---
// We need to import the 'register' and 'login' functions
// that are exported from our controller file.
const { register, login } = require('../controllers/authController');


// --- DEFINE THE ROUTES ---

// When a POST request is made to /api/auth/register, run the 'register' function.
router.post('/register', register);

// When a POST request is made to /api/auth/login, run the 'login' function.
// This is likely line 10, which was causing the error.
router.post('/login', login);


module.exports = router;