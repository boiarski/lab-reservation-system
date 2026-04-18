const pool = require('../../db');

function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(0, 0, 0, 0);
    return result;
}

function isSameDate(dateA, dateB) {
    return normalizeDate(dateA).getTime() === normalizeDate(dateB).getTime();
}

async function getUserReservations(userId) {
    const result = await pool.query(
        `SELECT r.id, r.user_id, r.equipment_id, e.name AS equipment_name, r.start_date, r.end_date, r.status, r.justification, r.completed_at, r.cancelled_at, r.rejection_reason, r.suggested_start_date, r.suggested_end_date, r.created_at FROM reservations r JOIN equipment e ON e.id = r.equipment_id         WHERE r.user_id = $1 ORDER BY r.start_date ASC`,
        [userId]
    );

    return result.rows;
}

async function getPendingApprovals() {
    const result = await pool.query(
        `SELECT r.id, r.user_id, u.name AS user_name, u.email AS user_email, r.equipment_id, e.name AS equipment_name, r.start_date, r.end_date, r.status, r.justification, r.created_at FROM reservations r JOIN users u ON u.id = r.user_id JOIN equipment e ON e.id = r.equipment_id WHERE r.status = 'pending_approval' ORDER BY r.created_at ASC`
    );

    return result.rows;
}

async function getPendingEquipmentReports() {
    const result = await pool.query(
        `SELECT er.id, er.equipment_id, e.name AS equipment_name, er.reported_by, u.name AS reported_by_name, u.email AS reported_by_email, er.reason, er.status, er.created_at FROM equipment_reports er JOIN equipment e ON e.id = er.equipment_id JOIN users u ON u.id = er.reported_by WHERE er.status = 'pending' ORDER BY er.created_at ASC`
    );

    return result.rows;
}

async function getOutOfOrderEquipment() {
    const result = await pool.query(
        `SELECT id, name, description, status
         FROM equipment
         WHERE status = 'out_of_order'
         ORDER BY name ASC`
    );

    return result.rows;
}

function buildUserWarnings(reservations) {
    const warnings = [];
    const today = normalizeDate(new Date());
    const tomorrow = addDays(today, 1);

    for (const reservation of reservations) {
        const startDate = normalizeDate(reservation.start_date);
        const endDate = normalizeDate(reservation.end_date);

        if (reservation.status === 'pending_approval') {
            warnings.push({
                type: 'pending_approval',
                message: `Your reservation for ${reservation.equipment_name} is pending approval.`,
                reservationId: reservation.id
            });
        }

        if (reservation.status === 'rejected') {
            const warning = {
                type: 'reservation_rejected',
                message: `Your reservation for ${reservation.equipment_name} was rejected.`,
                reservationId: reservation.id,
                reason: reservation.rejection_reason
            };

            if (reservation.suggested_start_date && reservation.suggested_end_date) {
                warning.suggestedStartDate = reservation.suggested_start_date;
                warning.suggestedEndDate = reservation.suggested_end_date;
            }

            warnings.push(warning);
        }

        if (reservation.status === 'approved' && isSameDate(startDate, tomorrow)) {
            warnings.push({
                type: 'starts_tomorrow',
                message: `Your reservation for ${reservation.equipment_name} starts tomorrow.`,
                reservationId: reservation.id
            });
        }

        if (reservation.status === 'approved' && isSameDate(endDate, today)) {
            warnings.push({
                type: 'ends_today',
                message: `Your reservation for ${reservation.equipment_name} ends today.`,
                reservationId: reservation.id
            });
        }
    }

    return warnings;
}

async function buildEarlyAvailabilityWarnings(userId) {
    const today = normalizeDate(new Date());
    const tomorrow = addDays(today, 1);

    const result = await pool.query(
        `SELECT next_r.id AS reservation_id, next_r.equipment_id, e.name AS equipment_name FROM reservations completed_r JOIN reservations next_r ON next_r.equipment_id = completed_r.equipment_id JOIN equipment e ON e.id = next_r.equipment_id WHERE completed_r.status = 'completed' AND completed_r.completed_at IS NOT NULL AND DATE(completed_r.completed_at) = $1 AND next_r.user_id = $2 AND next_r.status = 'approved' AND next_r.start_date = $3`,
        [today, userId, tomorrow]
    );

    return result.rows.map(row => ({
        type: 'early_availability',
        message: `${row.equipment_name} is available earlier than expected.`,
        reservationId: row.reservation_id,
        equipmentId: row.equipment_id
    }));
}

function buildPrivilegedWarnings({ pendingApprovals, pendingEquipmentReports, outOfOrderEquipment }) {
    const warnings = [];

    if (pendingApprovals.length > 0) {
        warnings.push({
            type: 'pending_reservation_approvals',
            message: `You have ${pendingApprovals.length} pending reservation approval(s).`
        });
    }

    if (pendingEquipmentReports.length > 0) {
        warnings.push({
            type: 'pending_equipment_reports',
            message: `You have ${pendingEquipmentReports.length} pending equipment issue report(s).`
        });
    }

    for (const equipment of outOfOrderEquipment) {
        warnings.push({
            type: 'equipment_out_of_order',
            message: `${equipment.name} is currently out of order.`,
            equipmentId: equipment.id
        });
    }

    return warnings;
}

async function getDashboardData(user) {
    const myReservations = await getUserReservations(user.id);

    let warnings = buildUserWarnings(myReservations);

    const earlyAvailabilityWarnings = await buildEarlyAvailabilityWarnings(user.id);
    warnings = warnings.concat(earlyAvailabilityWarnings);

    const dashboard = {
        user,
        myReservations,
        warnings
    };

    if (user.role === 'helper' || user.role === 'admin') {
        const pendingApprovals = await getPendingApprovals();
        const pendingEquipmentReports = await getPendingEquipmentReports();
        const outOfOrderEquipment = await getOutOfOrderEquipment();

        const privilegedWarnings = buildPrivilegedWarnings({
            pendingApprovals,
            pendingEquipmentReports,
            outOfOrderEquipment
        });

        dashboard.pendingApprovals = pendingApprovals;
        dashboard.pendingEquipmentReports = pendingEquipmentReports;
        dashboard.warnings = dashboard.warnings.concat(privilegedWarnings);
    }

    return dashboard;
}

module.exports = {
    getDashboardData
};