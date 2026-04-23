const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const equipmentController = require('./equipment.controller');

router.use(authMiddleware);

router.get('/', equipmentController.getAllEquipment);

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

router.get('/:id/availability', equipmentController.getEquipmentAvailability);
router.get('/:id', equipmentController.getEquipmentById);

router.post(
    '/',
    roleMiddleware(['admin']),
    equipmentController.createEquipment
);

router.put(
    '/:id',
    roleMiddleware(['admin']),
    equipmentController.updateEquipment
);

router.patch(
    '/:id/status',
    roleMiddleware(['helper', 'admin']),
    equipmentController.updateEquipmentStatus
);

router.patch(
    '/:id/decommission',
    roleMiddleware(['admin']),
    equipmentController.decommissionEquipment
);

router.post('/:id/report-issue', equipmentController.reportIssue);

module.exports = router;