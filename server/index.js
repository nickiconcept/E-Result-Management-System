
require('dotenv').config();
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

// Routes
const authRoutes = require('./routes/auth');
const resultRoutes = require('./routes/results');
const adminRoutes = require('./routes/admin');

const app = express();

// Database Connection
// Note: In Firebase, ensure DATABASE_URL is set via env variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for most cloud Postgres providers (Neon/Supabase)
  max: 1, // Limit connections for serverless environment
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(helmet());
app.use(cors({ origin: true })); // origin: true allows requests from your Firebase domain
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV });
});

// API Routes
app.use('/api/auth', authRoutes(pool));
app.use('/api/results', resultRoutes(pool));
app.use('/api/admin', adminRoutes(pool));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// EXPORT FOR FIREBASE FUNCTIONS
exports.api = functions.https.onRequest(app);

// LOCAL DEVELOPMENT SUPPORT
// Only listen if running locally (not in Firebase)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Local server running on port ${PORT}`);
  });
}
