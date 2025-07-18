// In backend/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// --- Register Controller (This version has the crucial hashing fix) ---
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 1. Create a new user instance WITHOUT the password initially.
        user = new User({ name, email, role: role || 'customer' });

        // 2. Hash the password separately.
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt); // Add the hashed password.

        // 3. THEN save the user. This guarantees the hashed password is saved.
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

// --- Login Controller (This version has the helpful logging) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    try {
        // Ensure the password field is returned from the database
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            // Log this on the server for debugging
            console.log(`Login attempt failed: User not found for email ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Log this on the server for debugging
            console.log(`Login attempt failed: Password mismatch for email ${email}`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log(`Login successful for user: ${email}`);
        res.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(`Server error during login for ${email}:`, err.message);
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
            user: { name: agent.name, email: agent.email, role: agent.role }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};