const reservationsService = require('./reservations.service');

async function getMyReservations(req, res) {
    try {
        const reservations = await reservationsService.getMyReservations(req.user.id);

        return res.status(200).json(reservations);
    } catch (error) {
        console.error('Get my reservations error:', error.message);

        return res.status(500).json({
            message: 'Error fetching reservations',
            debug: error.message
        });
    }
}

async function createReservation(req, res) {
    const { equipmentId, startDate, endDate, justification } = req.body;

    try {
        const reservation = await reservationsService.createReservation({
            userId: req.user.id,
            equipmentId,
            startDate,
            endDate,
            justification
        });

        return res.status(201).json({
            message: 'Reservation created successfully',
            reservation
        });
    } catch (error) {
        console.error('Create reservation error:', error);

        const knownErrors = [
            'equipmentId, startDate and endDate are required',
            'Invalid reservation dates',
            'Start date cannot be after end date',
            'Equipment not found',
            'Equipment is out of order',
            'Equipment is decommissioned',
            'Reservation conflicts with an existing reservation',
            'Justification is required for reservations longer than 7 days'
        ];

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error creating reservation',
            debug: error.message
        });
    }
}

async function cancelReservation(req, res) {
    const { id } = req.params;

    try {
        const reservation = await reservationsService.cancelReservation({
            userId: req.user.id,
            reservationId: id
        });

        return res.status(200).json({
            message: 'Reservation cancelled successfully',
            reservation
        });
    } catch (error) {
        console.error('Cancel reservation error:', error.message);

        const knownErrors = [
            'Reservation not found',
            'Only approved reservations can be cancelled',
            'Reservation cannot be cancelled after it has started'
        ];

        if (error.message === 'Reservation not found') {
            return res.status(404).json({ message: error.message });
        }

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error cancelling reservation',
            debug: error.message
        });
    }
}

async function completeReservation(req, res) {
    const { id } = req.params;

    try {
        const reservation = await reservationsService.completeReservation({
            userId: req.user.id,
            reservationId: id
        });

        return res.status(200).json({
            message: 'Reservation completed successfully',
            reservation
        });
    } catch (error) {
        console.error('Complete reservation error:', error.message);

        const knownErrors = [
            'Reservation not found',
            'Only approved reservations can be completed',
            'Reservation cannot be completed before it starts',
            'Reservation dropped due to outage'
        ];

        if (error.message === 'Reservation not found') {
            return res.status(404).json({ message: error.message });
        }

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error completing reservation',
            debug: error.message
        });
    }
}

async function getPendingReservations(req, res) {
    try {
        const reservations = await reservationsService.getPendingReservations();

        return res.status(200).json(reservations);
    } catch (error) {
        console.error('Get pending reservations error:', error);

        return res.status(500).json({
            message: 'Error fetching pending reservations',
            debug: error.message
        });
    }
}

async function approveReservation(req, res) {
    const { id } = req.params;

    try {
        const reservation = await reservationsService.approveReservation({
            reservationId: id,
            reviewerId: req.user.id
        });

        return res.status(200).json({
            message: 'Reservation approved successfully',
            reservation
        });
    } catch (error) {
        console.error('Approve reservation error:', error);

        if (error.message === 'Reservation not found') {
            return res.status(404).json({ message: error.message });
        }

        const knownErrors = [
            'Only pending reservations can be approved',
            'Cannot approve reservation because equipment is out of order',
            'Cannot approve reservation because equipment is decommissioned'
        ];

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error approving reservation',
            debug: error.message
        });
    }
}

async function rejectReservation(req, res) {
    const { id } = req.params;
    const { reason, suggestedStartDate, suggestedEndDate } = req.body;

    try {
        const reservation = await reservationsService.rejectReservation({
            reservationId: id,
            reviewerId: req.user.id,
            reason,
            suggestedStartDate,
            suggestedEndDate
        });

        return res.status(200).json({
            message: 'Reservation rejected successfully',
            reservation
        });
    } catch (error) {
        console.error('Reject reservation error:', error);

        if (error.message === 'Reservation not found') {
            return res.status(404).json({ message: error.message });
        }

        const knownErrors = [
            'Only pending reservations can be rejected',
            'Rejection reason is required',
            'Both suggestedStartDate and suggestedEndDate must be provided together',
            'Invalid suggested reservation dates',
            'Suggested start date cannot be after suggested end date'
        ];

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error rejecting reservation',
            debug: error.message
        });
    }
}

module.exports = {
    getMyReservations,
    createReservation,
    cancelReservation,
    completeReservation,
    getPendingReservations,
    approveReservation,
    rejectReservation
};