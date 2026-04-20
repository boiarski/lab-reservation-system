const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const usersController = require('./users.controller');

router.use(authMiddleware);

router.get('/me', usersController.getMe);
router.delete('/me', usersController.deleteOwnAccount);

router.get(
    '/',
    roleMiddleware(['admin']),
    usersController.getAllUsers
);

router.patch(
    '/:id/role',
    roleMiddleware(['admin']),
    usersController.updateUserRole
);

router.delete(
    '/:id',
    roleMiddleware(['admin']),
    usersController.deleteUser
);

module.exports = router;