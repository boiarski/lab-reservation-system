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

async function deleteUser(userId) {
    const result = await pool.query(
        `UPDATE users SET active = false WHERE id = $1 RETURNING id, name, email, role, active, created_at`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
}

module.exports = {
    getMe,
    deleteOwnAccount,
    getAllUsers,
    updateUserRole,
    deleteUser
};