// In main_backend/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- Register Controller (FIXED) ---
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // --- THIS IS THE FIX ---
        // 1. Create a new user instance WITHOUT the password initially.
        user = new User({
            name,
            email,
            role: role || 'customer'
        });

        // 2. Hash the password separately.
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt); // Add the hashed password to the user object.

        // 3. THEN save the user to the database. This guarantees the hashed password is saved.
        await user.save();
        // --------------------

        res.status(201).json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- Standard Login Controller (This part is correct and does not need changes) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // This function correctly compares the plain-text password from the login form
        // with the HASHED password from the database.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        res.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- Agent Login by Name (This part is correct and does not need changes) ---
exports.loginByName = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ msg: 'Agent name is required.' });
    }

    try {
        const agent = await User.findOne({ 
            name: { $regex: `^${name}$`, $options: 'i' },
            role: 'agent' 
        });
        
        if (!agent) {
            return res.status(404).json({ msg: `Agent '${name}' not found.` });
        }

        res.json({
            user: {
                name: agent.name,
                email: agent.email,
                role: agent.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};