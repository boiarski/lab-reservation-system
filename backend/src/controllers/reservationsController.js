const pool = require('../db');

exports.createReservation = async (req, res) => {
    const { user_id, equipment_id, start_date, end_date } = req.body;

    if (!user_id || !equipment_id || !start_date || !end_date) {
        return res.status(400).json({ message: 'Missing fields'});
    }

    if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({
            message: 'Start date cannot be after end date'
        });
    }

    try {
        const conflict = await pool.query(
            `SELECT * FROM reservations WHERE equipment_id = $1 AND start_date <= $3 AND end_date >= $2`,
            [equipment_id, start_date, end_date]
        );

        if (conflict.rows.length > 0) {
            return res.status(400).json({
                message: 'Equipment already reserved for these dates'
            });
        }

        const result = await pool.query(
            `INSERT INTO reservations (user_id, equipment_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, equipment_id, start_date, end_date]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creating reservation'
        });
    }
};

exports.getReservations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reservations');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

exports.getReservationsByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM reservations WHERE user_id = $1',
            [userId]
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: ' Error fetching user reservations' });
    }
};

exports.updateReservation = async (req, res) => {
    const { id } = req.params;
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
        return res.status(400).json({ message: ' Missing dates' });
    }

    if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({
            message: 'Start date cannot be after end date'
        });
    }

    try {
        const existing = await pool.query(
            'SELECT * FROM reservations WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = existing.rows[0];

        const conflict = await pool.query(
            `SELECT * FROM reservations WHERE equipment_id = $1 AND id != $2 AND ((start_date <= $3 AND end_date >= $3) OR (start_date <= $4 AND end_date >= $4) OR (start_date >= $3 AND end_date <= $4))`,
            [reservation.equipment_id, id, start_date, end_date]
        );

        if (conflict.rows.length > 0) {
            return res.status(400).json({
                message: 'Update dates conflict with another reservation'
            });
        }

        const result = await pool.query(
            `UPDATE reservations SET start_date = $1, end_date = $2 WHERE id = $3 RETURNING *`,
            [start_date, end_date, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating reservation' });
    }
};

exports.deleteReservation = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM reservations WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json({ message: 'Reservation deleted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting reservation' });
    }
};