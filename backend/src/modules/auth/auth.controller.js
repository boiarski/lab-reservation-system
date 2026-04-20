const authService = require('./auth.service');

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    try {
        const result = await authService.loginUser({ email, password });

        return res.status(200).json({
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        console.error('Login error:', error);

        if (
            error.message === 'Invalid credentials' ||
            error.message === 'User account is inactive'
        ) {
            return res.status(401).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error logging in',
            debug: error.message
        });
    }
}

module.exports = {
    login
};