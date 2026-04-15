const express = require('express');
const cors = require('cors');
const { sendError } = require('./utils/response');

// Route files
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// Catch 404
app.use((req, res, next) => {
  sendError(res, 404, 'Route not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendError(res, 500, 'Something went wrong on the server');
});

module.exports = app;
