const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  savedPassengers: [{
    name: String,
    age: Number,
    gender: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Flight Schema
const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  airline: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true }, // e.g. "08:30"
  arrivalTime: { type: String, required: true },   // e.g. "11:15"
  duration: { type: Number, required: true },      // in minutes
  stops: { type: Number, default: 0 },
  price: { type: Number, required: true },
  class: { type: String, enum: ['Economy', 'Business'], default: 'Economy' },
  refundable: { type: Boolean, default: true },
  availableSeats: { type: [String], default: [] }  // e.g. ["1A", "1B", "2C", ...]
});

// Train Schema
const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true },
  trainName: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  prices: {
    Sleeper: Number,
    '3A': Number,
    '2A': Number,
    '1A': Number
  },
  availableSeats: {
    Sleeper: Number,
    '3A': Number,
    '2A': Number,
    '1A': Number
  },
  quota: { type: [String], default: ['General', 'Tatkal', 'Ladies'] }
});

// Bus Schema
const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  operator: { type: String, required: true },
  busType: { type: String, enum: ['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater'], default: 'AC Seater' },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  price: { type: Number, required: true },
  amenities: { type: [String], default: [] }, // e.g. ["WiFi", "Water Bottle", "Charger"]
  availableSeats: { type: [String], default: [] }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  pnr: { type: String, required: true },
  userEmail: { type: String, required: true },
  travelType: { type: String, enum: ['flight', 'train', 'bus'], required: true },
  item: { type: mongoose.Schema.Types.Mixed, required: true }, // Details of the transport
  passengers: [{
    name: String,
    age: Number,
    gender: String
  }],
  selectedSeats: [String],
  paymentDetails: {
    method: String, // UPI, Card, NetBanking, Wallet
    amount: Number,
    txId: String,
    status: { type: String, default: 'Pending' }
  },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
  createdAt: { type: Date, default: Date.now }
});

// Coupon Schema
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minBookingValue: { type: Number, default: 0 },
  description: { type: String },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true }
});

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  messages: [{
    sender: String, // User or Admin/Support
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Flight: mongoose.model('Flight', flightSchema),
  Train: mongoose.model('Train', trainSchema),
  Bus: mongoose.model('Bus', busSchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Coupon: mongoose.model('Coupon', couponSchema),
  SupportTicket: mongoose.model('SupportTicket', supportTicketSchema)
};
