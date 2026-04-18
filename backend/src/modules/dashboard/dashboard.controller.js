const dashboardService = require('./dashboard.service');

async function getDashboard(req, res) {
    try {
        const dashboard = await dashboardService.getDashboardData(req.user);

        return res.status(200).json(dashboard);
    } catch (error) {
        console.error('Dashboard error:', error);

        return res.status(500).json({
            message: 'Error loading dashboard',
            debug: error.message
        });
    }
}

module.exports = {
    getDashboard
};