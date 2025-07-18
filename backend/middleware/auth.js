// In main_backend/routes/auth.js

const express = require('express');
const router = express.Router();

// --- EDIT THIS LINE ---
// Import all functions, including the new 'loginByName'
const { register, login, loginByName } = require('../controllers/authController');


// --- DEFINE THE ROUTES ---
router.post('/register', register);
router.post('/login', login);

// --- ADD THIS NEW ROUTE ---
// This route is specifically for the agent voice login feature
router.post('/login-by-name', loginByName);


module.exports = router;