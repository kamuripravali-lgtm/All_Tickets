const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  const mode = process.env.DATABASE_MODE || 'local';
  
  if (mode === 'mongodb') {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trip-ease');
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      console.log('Falling back to Local JSON Database Mode...');
      process.env.DATABASE_MODE = 'local';
      initializeLocalDB();
      return false;
    }
  } else {
    console.log('Running in Local JSON Database Mode.');
    initializeLocalDB();
    return true;
  }
};

const initializeLocalDB = () => {
  const dirPath = path.join(__dirname, '../data');
  const filePath = path.join(dirPath, 'db.json');

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const initialData = {
      users: [],
      flights: [],
      trains: [],
      buses: [],
      bookings: [],
      coupons: [],
      supportTickets: []
    };
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Local database file created at:', filePath);
  } else {
    console.log('Local database file found.');
  }
};

module.exports = connectDB;
