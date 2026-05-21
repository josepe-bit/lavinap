const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


/*
const cors = require('cors');
*/
// Permite peticiones desde tu frontend en Vercel
app.use(cors({
  origin: 'https://lavinap.vercel.app' // Reemplaza con la URL de tu frontend en Vercel
}));
