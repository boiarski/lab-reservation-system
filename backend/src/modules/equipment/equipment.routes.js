const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const equipmentController = require('./equipment.controller');

router.use(authMiddleware);

router.post('/:id/report-issue', equipmentController.reportIssue);

router.get(
    '/reports/pending',
    roleMiddleware(['helper', 'admin']),
    equipmentController.getPendingReports
);

router.patch(
    '/reports/:id/confirm',
    roleMiddleware(['helper', 'admin']),
    equipmentController.confirmReport
);

router.patch(
    '/reports/:id/dismiss',
    roleMiddleware(['helper', 'admin']),
    equipmentController.dismissReport
);

module.exports = router;