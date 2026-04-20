const pool = require('../../db');

async function reportIssue({ equipmentId, reportedBy, reason }) {
    if (!reason || !reason.trim()) {
        throw new Error('Report reason is required');
    }

    const equipmentResult = await pool.query(
        `SELECT id, name, status FROM equipment WHERE id = $1`,
        [equipmentId]
    );

    if (equipmentResult.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    const existingPendingReport = await pool.query(
        `SELECT id FROM equipment_reports WHERE equipment_id = $1 AND status = 'pending'`,
        [equipmentId]
    );

    if (existingPendingReport.rows.length > 0) {
        throw new Error('There is already a pending issue report for this equipment');
    }

    const result = await pool.query(
        `INSERT INTO equipment_reports (equipment_id, reported_by, reason, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
        [equipmentId, reportedBy, reason]
    );

    return result.rows[0];
}

async function getPendingReports() {
    const result = await pool.query(
        `SELECT er.id, er.equipment_id, e.name AS equipment_name, er.reported_by, u.name AS reported_by_name, u.email AS reported_by_email, er.reason, er.status, er.created_at FROM equipment_reports er JOIN equipment e ON e.id = er.equipment_id JOIN users u ON u.id = er.reported_by WHERE er.status = 'pending' ORDER BY er.created_at ASC`
    );

    return result.rows;
}

async function confirmReport({ reportId, reviewerId }) {
    const reportResult = await pool.query(
        `SELECT * FROM equipment_reports WHERE id = $1`,
        [reportId]
    );

    if (reportResult.rows.length === 0) {
        throw new Error('Report not found');
    }

    const report = reportResult.rows[0];

    if (report.status !== 'pending') {
        throw new Error('Only pending reports can be confirmed');
    }

    await pool.query('BEGIN');

    try {
        const updateReport = await pool.query(
            `UPDATE equipment_reports SET status = 'confirmed', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2 RETURNING *`,
            [reviewerId, reportId]
        );

        await pool.query(
            `UPDATE equipment SET status = 'out_of_order' WHERE id = $1`,
            [report.equipmentId]
        );

        await pool.query('COMMIT');

        return updateReport.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
}

async function dismissReport({ reportId, reviewerId }) {
    const reportResult = await pool.query(
        `SELECT * FROM equipment_reports WHERE id = $1`,
        [reportId]
    );

    if (reportResult.rows.length === 0) {
        throw new Error('Report not found');
    }

    const report = reportResult.rows[0];

    if (report.status !== 'pending') {
        throw new Error('Only pending reports can be dismissed');
    }

    const updatedReport = await pool.query(
        `UPDATE equipment_reports SET status = 'dismissed', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2 RETURNING *`,
        [reviewerId, reportId]
    );

    return updatedReport.rows[0];
}

async function getAllEquipment() {
    const result = await pool.query(
        `SELECT id, name, description, status, created_at FROM equipment ORDER BY id ASC`
    );

    return result.rows;
}

async function getEquipmentById(equipmentId) {
    const result = await pool.query(
        `SELECT id, name, description, status, created_at FROM equipment WHERE id = $1`,
        [equipmentId]
    );

    if (result.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    return result.rows[0];
}

async function getEquipmentAvailability(equipmentId) {
    const equipmentResult = await pool.query(
        `SELECT id, name, description, status, created_at FROM equipment WHERE id = $1`,
        [equipmentId]
    );

    if (equipmentResult.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    const reservationsResult = await pool.query(
        `SELECT id, start_date, end_date, status FROM reservations WHERE equipment_id = $1 AND status IN ('approved', 'pending_approval') ORDER BY start_date ASC`,
        [equipmentId]
    );

    return {
        equipment: equipmentResult.rows[0],
        reservations: reservationsResult.rows
    };
}

async function createEquipment({ name, description }) {
    if (!name || !name.trim()) {
        throw new Error('Equipment name is required');
    }

    const result = await pool.query(
        `INSERT INTO equipment (name, description, status) VALUES ($1, $2, 'available') RETURNING *`,
        [name, description || null]
    );

    return result.rows[0];
}

async function updateEquipment({ equipmentId, name, description }) {
    if (!name || !name.trim()) {
        throw new Error('Equipment name is required');
    }

    const result = await pool.query(
        `UPDATE equipment SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
        [name, description || null, equipmentId]
    );

    if (result.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    return result.rows[0];
}

async function updateEquipmentStatus({ equipmentId, status }) {
    const allowedStatuses = ['available', 'out_of_order'];

    if (!allowedStatuses.includes(status)) {
        throw new Error('Invalid equipment status');
    }

    const result = await pool.query(
        `UPDATE equipment SET status = $1 WHERE id = $2 RETURNING *`,
        [status, equipmentId]
    );

    if (result.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    return result.rows[0];
}

async function deleteEquipment(equipmentId) {
    const result = await pool.query(
        `DELETE FROM equipment WHERE id = $1 RETURNING *`,
        [equipmentId]
    );

    if (result.rows.length === 0) {
        throw new Error('Equipment not found');
    }

    return result.rows[0];
}

module.exports = {
    reportIssue,
    getPendingReports,
    confirmReport,
    dismissReport,
    getAllEquipment,
    getEquipmentById,
    getEquipmentAvailability,
    createEquipment,
    updateEquipment,
    updateEquipmentStatus,
    deleteEquipment
};