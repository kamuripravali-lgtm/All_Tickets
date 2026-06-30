const { Booking, Flight, Train, Bus, User, Coupon } = require('../models');

exports.getStats = async (req, res) => {
  try {
    const bookings = await Booking.find({});
    const usersCount = await User.countDocuments({ role: 'user' });
    const flightsCount = await Flight.countDocuments({});
    const trainsCount = await Train.countDocuments({});
    const busesCount = await Bus.countDocuments({});

    // Calculate revenue & refund status
    let totalRevenue = 0;
    let totalRefunds = 0;
    let successfulBookings = 0;
    let cancelledBookings = 0;

    bookings.forEach(b => {
      if (b.status === 'Cancelled') {
        cancelledBookings++;
        totalRefunds += b.paymentDetails.amount;
      } else {
        successfulBookings++;
        totalRevenue += b.paymentDetails.amount;
      }
    });

    // Recent 5 bookings
    const recentBookings = [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      metrics: {
        totalBookings: bookings.length,
        successfulBookings,
        cancelledBookings,
        totalRevenue,
        totalRefunds,
        totalUsers: usersCount,
        flightsCount,
        trainsCount,
        busesCount
      },
      recentBookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Flights CRUD
exports.addFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(flight);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flight deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Trains CRUD
exports.addTrain = async (req, res) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(train);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTrain = async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    res.json({ message: 'Train deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Buses CRUD
exports.addBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Coupons CRUD
exports.addCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
