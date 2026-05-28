require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL, /\.onrender\.com$/].filter(Boolean)
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bugs', require('./routes/bugs'));
app.use('/api/test-cases', require('./routes/testCases'));
app.use('/api/test-suites', require('./routes/testSuites'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QA Management Suite API is running' });
});

app.use(errorHandler);

// Serve React build in production (single-server deployment)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});