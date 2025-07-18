// In: main_backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Make sure this is at the top

const app = express();
const PORT = process.env.PORT || 8000;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for your React app
app.use(cors()); 
// Enable the server to accept and parse JSON in request bodies
app.use(express.json()); 


// --- Database Connection (FIXED) ---
// This block is now active. It will connect to the database using the MONGO_URI from your .env file.
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected...');
    })
    .catch(err => {
        // This provides a more helpful error message and stops the server if the database can't connect.
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });


// --- API Routes (FIXED) ---
// Authentication route is now active.
app.use('/api/auth', require('./routes/auth'));

// We'll keep the conversations route commented out until you build that feature.
// app.use('/api/conversations', require('./routes/conversations'));


// --- Server Startup ---
app.listen(PORT, () => console.log(`✅ Server is running on http://localhost:${PORT}`));