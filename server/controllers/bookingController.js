const { Booking, Flight, Train, Bus, Coupon } = require('../models');

// Helper to generate PNR
const generatePNR = () => {
  return 'PNR-' + Math.floor(100000 + Math.random() * 900000);
};

// Helper to generate Booking ID
const generateBookingId = () => {
  return 'TKB-' + Math.floor(10000000 + Math.random() * 90000000);
};

exports.createBooking = async (req, res) => {
  try {
    const { travelType, itemId, passengers, selectedSeats, paymentMethod, baseFare, couponCode } = req.body;
    const userEmail = req.user.email;

    if (!travelType || !itemId || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: 'Missing booking details' });
    }

    // 1. Get transport details and check availability
    let transportItem;
    if (travelType === 'flight') {
      transportItem = await Flight.findById(itemId);
      if (!transportItem) return res.status(404).json({ message: 'Flight not found' });
      
      // Check seats
      const allAvailable = selectedSeats.every(seat => transportItem.availableSeats.includes(seat));
      if (!allAvailable) return res.status(400).json({ message: 'Some selected seats are no longer available' });
      
      // Update seats (remove selected seats from available)
      const newSeats = transportItem.availableSeats.filter(seat => !selectedSeats.includes(seat));
      await Flight.findByIdAndUpdate(itemId, { availableSeats: newSeats });
      
    } else if (travelType === 'train') {
      transportItem = await Train.findById(itemId);
      if (!transportItem) return res.status(404).json({ message: 'Train not found' });

      // For train, we check class and availability
      const trainClass = req.body.trainClass || 'Sleeper';
      if (transportItem.availableSeats[trainClass] < passengers.length) {
        return res.status(400).json({ message: `Insufficient seats in class ${trainClass}` });
      }

      // Decrement seats
      const updatedAvailable = { ...transportItem.availableSeats };
      updatedAvailable[trainClass] -= passengers.length;
      await Train.findByIdAndUpdate(itemId, { availableSeats: updatedAvailable });

    } else if (travelType === 'bus') {
      transportItem = await Bus.findById(itemId);
      if (!transportItem) return res.status(404).json({ message: 'Bus not found' });

      const allAvailable = selectedSeats.every(seat => transportItem.availableSeats.includes(seat));
      if (!allAvailable) return res.status(400).json({ message: 'Some selected seats are no longer available' });

      // Update seats
      const newSeats = transportItem.availableSeats.filter(seat => !selectedSeats.includes(seat));
      await Bus.findByIdAndUpdate(itemId, { availableSeats: newSeats });
    }

    // 2. Validate coupon and calculate price
    let discount = 0;
    let finalAmount = baseFare;
    
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon) {
        if (baseFare >= coupon.minBookingValue) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round((baseFare * coupon.discountValue) / 100);
          } else {
            discount = coupon.discountValue;
          }
          finalAmount = Math.max(0, baseFare - discount);
        }
      }
    }

    // Add taxes and booking fee
    const taxes = Math.round(baseFare * 0.05); // 5% GST
    const convenienceFee = 150;
    const grandTotal = finalAmount + taxes + convenienceFee;

    // 3. Create Booking
    const booking = await Booking.create({
      bookingId: generateBookingId(),
      pnr: generatePNR(),
      userEmail,
      travelType,
      item: transportItem,
      passengers,
      selectedSeats,
      paymentDetails: {
        method: paymentMethod || 'Card',
        amount: grandTotal,
        txId: 'TXN-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        status: 'Success'
      },
      status: 'Upcoming'
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userEmail: req.user.email });
    // Sort bookings by creation date descending
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.userEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // 1. Release seats
    const { travelType, item, selectedSeats } = booking;
    if (travelType === 'flight') {
      const flight = await Flight.findById(item._id);
      if (flight) {
        // Return seats
        const updatedSeats = [...flight.availableSeats, ...selectedSeats];
        await Flight.findByIdAndUpdate(item._id, { availableSeats: updatedSeats });
      }
    } else if (travelType === 'train') {
      const train = await Train.findById(item._id);
      if (train) {
        const trainClass = booking.selectedSeats[0]?.split('-')[0] || 'Sleeper'; // Mocked class identifier
        const updatedSeats = { ...train.availableSeats };
        updatedSeats[trainClass] += booking.passengers.length;
        await Train.findByIdAndUpdate(item._id, { availableSeats: updatedSeats });
      }
    } else if (travelType === 'bus') {
      const bus = await Bus.findById(item._id);
      if (bus) {
        const updatedSeats = [...bus.availableSeats, ...selectedSeats];
        await Bus.findByIdAndUpdate(item._id, { availableSeats: updatedSeats });
      }
    }

    // 2. Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Cancelled',
        'paymentDetails.status': 'Refunded'
      },
      { new: true }
    );

    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    if (amount < coupon.minBookingValue) {
      return res.status(400).json({ 
        message: `Minimum booking value for this coupon is ₹${coupon.minBookingValue}` 
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((amount * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      code: coupon.code,
      discount,
      description: coupon.description
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
