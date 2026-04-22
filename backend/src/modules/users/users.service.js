const bcrypt = require('bcryptjs');
const pool = require('../../db');

async function getMe(userId) {
    const result = await pool.query(
        `SELECT id, name, email, role, active, created_at FROM users WHERE id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
}

async function deleteOwnAccount(userId) {
    const result = await pool.query(
        `UPDATE users SET active = false WHERE id = $1 RETURNING id, name, email, role, active, created_at`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
}

async function getAllUsers() {
    const result = await pool.query(
        `SELECT id, name, email, role, active, created_at FROM users ORDER BY id ASC`
    );

    return result.rows;
}

async function updateUserRole({ userId, role }) {
    const allowedRoles = ['user', 'helper', 'admin'];

    if (!allowedRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    const result = await pool.query(
        `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, active, created_at`,
        [role, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
}

async function updateUserActiveStatus({ userId, active }) {
    if (typeof active !== 'boolean') {
        throw new Error('Active must be a boolean');
    }

    const result = await pool.query(
        `UPDATE users
         SET active = $1
         WHERE id = $2
         RETURNING id, name, email, role, active, created_at`,
        [active, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
}

async function createUser({ name, email, password, role }) {
    const allowedRoles = ['user', 'helper', 'admin'];

    if (!name || !email || !password) {
        throw new Error('Name, email and password are required');
    }

    if (role && !allowedRoles.includes(role)) {
        throw new Error('Invalid role');
    }

    const existingUser = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, active, created_at`,
        [name, email, passwordHash, role || 'user']
    );

    return result.rows[0];
}

async function changeOwnPassword({ userId, currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 6) {
        throw new Error('New password must have at least 6 characters');
    }

    const result = await pool.query(
        `SELECT id, password_hash FROM users WHERE id = $1 AND active = true`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [newPasswordHash, userId]
    );

    return true;
}

module.exports = {
    getMe,
    deleteOwnAccount,
    getAllUsers,
    updateUserRole,
    updateUserActiveStatus,
    createUser,
    changeOwnPassword
};