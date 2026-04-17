const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const reservationsController = require('./reservations.controller');

router.use(authMiddleware);

router.get('/me', reservationsController.getMyReservations);
router.post('/', reservationsController.createReservation);
router.patch('/:id/cancel', reservationsController.cancelReservation);
router.patch('/:id/complete', reservationsController.completeReservation);
router.get('/pending', roleMiddleware(['helper', 'admin']), reservationsController.getPendingReservations);
router.patch('/:id/approve', roleMiddleware(['helper', 'admin']), reservationsController.approveReservation);
router.patch('/:id/reject', roleMiddleware(['helper', 'admin']), reservationsController.rejectReservation);

module.exports = router;