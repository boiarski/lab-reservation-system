const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const reservationsController = require('./reservations.controller');

router.use(authMiddleware);

router.get('/me', reservationsController.getMyReservations);
router.post('/', reservationsController.createReservation);
router.patch('/:id/cancel', reservationsController.cancelReservation);
router.patch('/:id/complete', reservationsController.completeReservation);

module.exports = router;