// In main_backend/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- Register Controller ---
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role: role || 'customer'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

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

// --- Standard Login Controller ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

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

// --- ADD THIS NEW FUNCTION ---
// @desc    Find an agent by name for voice login
// @route   POST /api/auth/login-by-name
exports.loginByName = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ msg: 'Agent name is required.' });
    }

    try {
        // Find a user who is an 'agent' and whose name matches (case-insensitive)
        const agent = await User.findOne({ 
            name: { $regex: `^${name}$`, $options: 'i' }, // Case-insensitive exact match
            role: 'agent' 
        });
        
        if (!agent) {
            return res.status(404).json({ msg: `Agent '${name}' not found.` });
        }

        // If agent is found, return their user data
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