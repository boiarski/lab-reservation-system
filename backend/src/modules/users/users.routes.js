const express = require('express');
const router = express.Router();

const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');
const usersController = require('./users.controller');

router.use(authMiddleware);

router.get('/me', usersController.getMe);

router.patch('/me/password', usersController.changeOwnPassword);
router.delete('/me', usersController.deleteOwnAccount);

router.get('/', roleMiddleware(['admin']), usersController.getAllUsers);

router.post('/', roleMiddleware(['admin']), usersController.createUser);

router.patch('/:id/role', roleMiddleware(['admin']), usersController.updateUserRole);

router.patch('/:id/status', roleMiddleware(['admin']), usersController.updateUserActiveStatus);

module.exports = router;