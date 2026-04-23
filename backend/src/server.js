const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./modules/auth/auth.routes');
const reservationsRoutes = require('./modules/reservations/reservations.routes');
const equipmentRoutes = require('./modules/equipment/equipment.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const usersRoutes = require('./modules/users/users.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        return res.json({
            status: 'ok',
            time: result.rows[0]
        });
    } catch (error) {
        console.error('Health check error:', error.message);

        return res.status(500).json({
            status: 'error',
            message: 'Database connection failed'
        });
    }
});

app.use('/auth', authRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;