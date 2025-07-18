// In: main_backend/routes/conversations.js

const express = require('express');
const router = express.Router();

// ** THE FIX IS HERE **
// We use curly braces { } to "destructure" the functions we need
// from the object that chatController.js exported.
const { 
    saveConversation, 
    getConversations 
} = require('../controllers/chatController');

// This line from your error log: router.post()
// It now correctly receives the 'saveConversation' function.
router.post('/save', saveConversation);

// We can also define the route for getting history
router.get('/history', getConversations);


module.exports = router;