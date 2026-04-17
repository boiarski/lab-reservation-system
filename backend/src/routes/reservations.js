const express = require('express');
const router = express.Router();
const controller = require('../controllers/reservationsController');

router.post('/', controller.createReservation);
router.get('/', controller.getReservations);
router.get('/user/:userId', controller.getReservationsByUser);
router.put('/:id', controller.updateReservation);
router.delete('/:id', controller.deleteReservation);

module.exports = router;