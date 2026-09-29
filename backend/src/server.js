const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const { initializeDatabase } = require('./config/initDb');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeDatabase();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const materialRoutes = require('./routes/materials');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LAN Restaurant POS API is running.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.', error: err.message });
});

module.exports = app;
