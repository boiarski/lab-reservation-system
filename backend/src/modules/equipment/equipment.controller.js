const equipmentService = require('./equipment.service');

async function reportIssue(req, res) {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const report = await equipmentService.reportIssue({
            equipmentId: id,
            reportedBy: req.user.id,
            reason
        });

        return res.status(201).json({
            message: 'Equipment issue reported successfully',
            report
        });
    } catch (error) {
        console.error('Report issue error:', error);

        const knownErrors = [
            'Report reason is required',
            'Equipment not found',
            'There is already a pending issue report for this equipment'
        ];

        if (error.message === 'Equipment not found') {
            return res.status(404).json({ message: error.message });
        }

        if (knownErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error reporting equipment issue',
            debug: error.message
        });
    }
}

async function getPendingReports(req, res) {
    try {
        const reports = await equipmentService.getPendingReports();

        return res.status(200).json(reports);
    } catch (error) {
        console.error('Get pending reports error:', error);

        return res.status(500).json({
            message: 'Error fetching pending reports',
            debug: error.message
        });
    }
}

async function confirmReport(req, res) {
    const { id } = req.params;

    try {
        const report = await equipmentService.confirmReport({
            reportId: id,
            reviewerId: req.user.id
        });

        return res.status(200).json({
            message: 'Issue report confirmed successfully',
            report
        });
    } catch (error) {
        console.error('Confirm report error:', error);

        if (error.message === 'Report not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Only pending reports can be confirmed') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error confirming issue report',
            debug: error.message
        });
    }
}

async function dismissReport(req, res) {
    const { id } = req.params;

    try {
        const report = await equipmentService.dismissReport({
            reportId: id,
            reviewerId: req.user.id
        });

        return res.status(200).json({
            message: 'Issue report dismissed successfully',
            report
        });
    } catch (error) {
        console.error('Dismiss report error:', error);

        if (error.message === 'Report not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Only pending reports can be dismissed') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error dismissing issue report',
            debug: error.message
        });
    }
}

async function getAllEquipment(req, res) {
    try {
        const equipment = await equipmentService.getAllEquipment();

        return res.status(200).json(equipment);
    } catch (error) {
        console.error('Get all equipment error:', error);

        return res.status(500).json({
            message: 'Error fetching equipment',
            debug: error.message
        });
    }
}

async function getEquipmentById(req, res) {
    const { id } = req.params;

    try {
        const equipment = await equipmentService.getEquipmentById(id);

        return res.status(200).json(equipment);
    } catch (error) {
        console.error('Get equipment by id error:', error);

        if (error.message === 'Equipment not found') {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error fetching equipment details',
            debug: error.message
        });
    }
}

async function getEquipmentAvailability(req, res) {
    const { id } = req.params;

    try {
        const availability = await equipmentService.getEquipmentAvailability(id);

        return res.status(200).json(availability);
    } catch (error) {
        console.error('Get equipment availability error:', error);

        if (error.message === 'Equipment not found') {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error fetching equipment availability',
            debug: error.message
        });
    }
}

async function createEquipment(req, res) {
    const { name, description } = req.body;

    try {
        const equipment = await equipmentService.createEquipment({
            name,
            description
        });

        return res.status(201).json({
            message: 'Equipment created successfully',
            equipment
        });
    } catch (error) {
        console.error('Create equipment error:', error);

        if (error.message === 'Equipment name is required') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error creating equipment',
            debug: error.message
        });
    }
}

async function updateEquipment(req, res) {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const equipment = await equipmentService.updateEquipment({
            equipmentId: id,
            name,
            description
        });

        return res.status(200).json({
            message: 'Equipment updated successfully',
            equipment
        });
    } catch (error) {
        console.error('Update equipment error:', error);

        if (error.message === 'Equipment not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Equipment name is required') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error updating equipment',
            debug: error.message
        });
    }
}

async function updateEquipmentStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const equipment = await equipmentService.updateEquipmentStatus({
            equipmentId: id,
            status
        });

        return res.status(200).json({
            message: 'Equipment status updated successfully',
            equipment
        });
    } catch (error) {
        console.error('Update equipment status error:', error);

        if (error.message === 'Equipment not found') {
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Invalid equipment status') {
            return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error updating equipment status',
            debug: error.message
        });
    }
}

async function deleteEquipment(req, res) {
    const { id } = req.params;

    try {
        const equipment = await equipmentService.deleteEquipment(id);

        return res.status(200).json({
            message: 'Equipment deleted successfully',
            equipment
        });
    } catch (error) {
        console.error('Delete equipment error:', error);

        if (error.message === 'Equipment not found') {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({
            message: 'Error deleting equipment',
            debug: error.message
        });
    }
}

module.exports = {
    reportIssue,
    getPendingReports,
    confirmReport,
    dismissReport,
    getAllEquipment,
    getEquipmentById,
    getEquipmentAvailability,
    createEquipment,
    updateEquipment,
    updateEquipmentStatus,
    deleteEquipment
};