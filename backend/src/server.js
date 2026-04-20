const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./modules/auth/auth.routes');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
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
        res.json({
            status: 'ok',
            time: result.rows[0]
        });
    } catch (error) {
        console.error('Health check error:', error.message);
        res.status(500).json({
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

app.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Protected route working',
        user: req.user
    });
});

app.get('/admin-test', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    res.json({
        message: 'Admin route working',
        user: req.user
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});