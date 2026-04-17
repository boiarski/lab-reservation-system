const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db');
const { jwtSecret, jwtExpiresIn } = require('../../config/auth');

async function registerUser({ name, email, password }) {
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, name, email, role, active, created_at`,
        [name, email, passwordHash]
    );

    return result.rows[0];
}

async function loginUser({ email, password }) {
    const result = await pool.query(
        `SELECT id, name, email, password_hash, role, active FROM users WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    if (!user.active) {
        throw new Error('User account is inactive');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn}
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
}

module.exports = {
    registerUser,
    loginUser
};