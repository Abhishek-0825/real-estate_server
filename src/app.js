const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Root Route
app.get('/', (req, res) => {
  res.send('Real Estate API is running 🚀');
});

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 Handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
