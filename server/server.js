const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Map API routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Server static assets in production if needed
// For now, we serve a simple status endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the TripEase Travel Booking API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed if database is empty
    const { Flight } = require('./models');
    const flightCount = await Flight.countDocuments();
    if (flightCount === 0) {
      console.log('Database appears to be empty. Seeding initial travel schedule...');
      const seed = require('./data/seed');
      await seed();
    } else {
      console.log(`Database has ${flightCount} flights. Skipping auto-seed.`);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
