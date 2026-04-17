const pool = require('../../db');

function calculateInclusiveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffInMs = end - start;

    return Math.floor(diffInMs / millisecondsPerDay) +1;
}

async function getMyReservations(userId) {
    const result = await pool.query(
        `SELECT r.id, r.user_id, r.equipment_id, e.name AS equipment_name, r.start_date, r.end_date, r.status, r.justification, r.approved_by, r.approved_at, r.completed_at, r.cancelled_at, r.rejection_reason, r.suggested_start_date, r.suggested_end_date, r.created_at FROM reservations r JOIN equipment e ON e.id = r.equipment_id WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
        [userId]
    );

    return result.rows;
}

async function createReservation({ userId, equipmentId, startDate, endDate, justification }) {
    if (!equipmentId || !startDate || !endDate) {
        throw new Error('equipmentId, startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error('Invalid reservation dates');
    }

    if (start > end) {
        throw new Error('Start date cannot be after end date');        
    }

    const equipmentResult = await pool.query(
        'SELECT id, name, status FROM equipment WHERE id = $1',
        [equipmentId]
    );

    if (equipmentResult.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    const equipment = equipmentResult.rows[0];

    if (equipment.status === 'out_of_order') {
        throw new Error('Equipment is out of order');
    }

    const conflictResult = await pool.query(
        `SELECT id FROM reservations WHERE equipment_id = $1 AND status IN ('approved', 'pending_approval') AND NOT ($3 < start_date OR $2 > end_date)`,
        [equipmentId, startDate, endDate]
    );

    if (conflictResult.rows.length > 0) {
        throw new Error('Reservation conflicts with an existing reservation');
    }

    const totalDays = calculateInclusiveDays(startDate, endDate);

    let status = 'approved';

    if (totalDays > 7) {
        if (!justification || !justification.trim()) {
            throw new Error('Justification is required for reservations longer than 7 days');
        }

        status = 'pending_approval';
    }

    const result = await pool.query(
        `INSERT INTO reservations (user_id, equipment_id, start_date, end_date, status, justification) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, equipmentId, startDate, endDate, status, justification || null]
    );

    return result.rows[0];
}

async function cancelReservation({ userId, reservationId }) {
    const result = await pool.query(
        `SELECT * FROM reservations WHERE id = $1 AND user_id = $2`,
        [reservationId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('Reservation not found');
    }

    const reservation = result.rows[0];

    if (reservation.status !== 'approved') {
        throw new Error('Only approved reservations can be cancelled');
    }

    const today = new Date();
    const startDate = new Date(reservation.start_date);

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    if (today >= startDate) {
        throw new Error('Reservation cannot be cancelled after it has started');
    }

    const updateResult = await pool.query(
        `UPDATE reservations SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1 RETURNING *`,
        [reservationId]
    );

    return updateResult.rows[0];
}

async function completeReservation({ userId, reservationId }) {
    const result = await pool.query(
        `SELECT * FROM reservations WHERE id = $1 AND user_id = $2`,
        [reservationId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('Reservation not found');
    }

    const reservation = result.rows[0];

    if (reservation.status !== 'approved') {
        throw new Error('Only approved reservations can be completed');
    }

    const today = new Date();
    const startDate = new Date(reservation.start_date);

    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
        throw new Error('Reservation cannot be completed before it starts');
    }

    const updateResult = await pool.query(
        `UPDATE reservations SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *`,
        [reservationId]
    );

    return updateResult.rows[0];
}

module.exports = {
    getMyReservations,
    createReservation,
    cancelReservation,
    completeReservation
};