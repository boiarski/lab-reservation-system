const usersService = require('./users.service');

async function getMe(req, res) {
    try {
        const user = await usersService.getMe(req.user.id);
        return res.status(200).json(user);
    } catch (error) {
        console.error('Get me error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error fetching user',
            debug: error.message
        });
    }
}

async function deactivateOwnAccount(req, res) {
    try {
        const user = await usersService.deactivateOwnAccount(req.user.id);

        return res.status(200).json({
            message: 'Account deactivated successfully',
            user
        });
    } catch (error) {
        console.error('Deactivate own account error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Admins cannot deactivate their own account') {
            return res.status(403).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error deactivating account',
            debug: error.message
        });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await usersService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.error('Get users error:', error);

        return res.status(500).json({
            message: 'Error fetching users',
            debug: error.message
        });
    }
}

async function updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await usersService.updateUserRole({
            userId: id,
            role
        });

        return res.status(200).json({
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user role error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Invalid role') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error updating user role',
            debug: error.message
        });
    }
}

async function createUser(req, res) {
    const { name, email, password, role } = req.body;

    try {
        const user = await usersService.createUser({
            name,
            email,
            password,
            role
        });

        return res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (error) {
        console.error('Create user error:', error);

        const knownErrors = [
            'Name, email and password are required',
            'Invalid role',
            'Email already in use'
        ];

        if (error.message === 'Email already in use') {
            return res.status(409).json({ message: error.message });
        }

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error creating user',
            debug: error.message
        });
    }
}

async function updateUserActiveStatus(req, res) {
    const { id } = req.params;
    const { active } = req.body;

    try {
        const user = await usersService.updateUserActiveStatus({
            userId: id,
            active
        });

        return res.status(200).json({
            message: active
                ? 'User activated successfully'
                : 'User deactivated successfully',
            user
        });
    } catch (error) {
        console.error('Update user active status error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Active must be a boolean') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error updating user status',
            debug: error.message
        });
    }
}

async function changeOwnPassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    try {
        await usersService.changeOwnPassword({
            userId: req.user.id,
            currentPassword,
            newPassword
        });

        return res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);

        const knownErrors = [
            'Current password and new password are required',
            'New password must have at least 6 characters',
            'Current password is incorrect'
        ];

        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        }

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error changing password',
            debug: error.message
        });
    }
}

module.exports = {
    getMe,
    deactivateOwnAccount,
    getAllUsers,
    updateUserRole,
    updateUserActiveStatus,
    createUser,
    changeOwnPassword
};