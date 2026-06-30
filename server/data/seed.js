const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Set DATABASE_MODE so models load correctly
process.env.DATABASE_MODE = process.env.DATABASE_MODE || 'local';

// Setup basic environment if needed
const getModels = () => {
  return require('../models');
};

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Goa'];

const airlines = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'Vistara', code: 'UK' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Akasa Air', code: 'QP' }
];

const trainNames = [
  'Rajdhani Express',
  'Shatabdi Express',
  'Vande Bharat Express',
  'Duronto Express',
  'Garib Rath'
];

const busOperators = [
  'VRL Travels',
  'SRS Travels',
  'Orange Travels',
  'KSRTC',
  'National Travels',
  'Zingbus'
];

const generateSeats = (type) => {
  const seats = [];
  if (type === 'flight') {
    // 6 seats per row, A-F, 20 rows
    for (let r = 1; r <= 20; r++) {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
        seats.push(`${r}${col}`);
      });
    }
  } else if (type === 'bus') {
    // Bus: 1 to 40 seats.
    // L1, L2, L3... for lower deck, U1, U2... for upper deck
    for (let i = 1; i <= 20; i++) {
      seats.push(`L${i}`);
      seats.push(`U${i}`);
    }
  }
  return seats;
};

const seed = async () => {
  const models = getModels();
  const { User, Flight, Train, Bus, Coupon, Booking, SupportTicket } = models;

  console.log('Seeding database in mode:', process.env.DATABASE_MODE);

  try {
    // 1. Clear database
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Flight.deleteMany({});
    await Train.deleteMany({});
    await Bus.deleteMany({});
    await Coupon.deleteMany({});
    await Booking.deleteMany({});
    await SupportTicket.deleteMany({});

    // 2. Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash('user123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    await User.insertMany([
      {
        name: 'John Doe',
        email: 'user@tripease.com',
        password: userPassword,
        role: 'user',
        savedPassengers: [
          { name: 'Jane Doe', age: 28, gender: 'Female' },
          { name: 'Tommy Doe', age: 8, gender: 'Male' }
        ]
      },
      {
        name: 'System Admin',
        email: 'admin@tripease.com',
        password: adminPassword,
        role: 'admin',
        savedPassengers: []
      }
    ]);

    // 3. Coupons
    console.log('Creating coupons...');
    await Coupon.insertMany([
      { code: 'TRIPNEW', discountType: 'percentage', discountValue: 15, minBookingValue: 1000, description: '15% Off for new users on booking above ₹1000', isActive: true },
      { code: 'FLY500', discountType: 'fixed', discountValue: 500, minBookingValue: 4000, description: 'Flat ₹500 Off on flights (Min. Booking ₹4000)', isActive: true },
      { code: 'RAILSAVER', discountType: 'percentage', discountValue: 10, minBookingValue: 500, description: '10% Off on train tickets up to ₹150', isActive: true },
      { code: 'BUSBUDDY', discountType: 'fixed', discountValue: 100, minBookingValue: 600, description: 'Flat ₹100 Off on bus bookings (Min. Booking ₹600)', isActive: true },
      { code: 'FESTIVE10', discountType: 'percentage', discountValue: 20, minBookingValue: 2000, description: 'Festival Special: 20% Off up to ₹800', isActive: true }
    ]);

    // 4. Flights
    console.log('Creating flights...');
    const flightsToInsert = [];
    let flightCounter = 100;
    
    // Generate flights between all city pairs
    for (let from of cities) {
      for (let to of cities) {
        if (from === to) continue;

        // Create 2-3 flights per route
        for (let i = 0; i < 2; i++) {
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          const depHour = 6 + Math.floor(Math.random() * 14); // 06:00 to 20:00
          const depMin = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
          const depStr = `${depHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;
          
          const duration = 90 + Math.floor(Math.random() * 120); // 90 to 210 mins
          const arrMinTotal = depHour * 60 + depMin + duration;
          const arrHour = Math.floor(arrMinTotal / 60) % 24;
          const arrMin = arrMinTotal % 60;
          const arrStr = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;

          const price = 3000 + Math.floor(Math.random() * 6000);
          const flightNo = `${airline.code}-${flightCounter++}`;

          flightsToInsert.push({
            flightNumber: flightNo,
            airline: airline.name,
            from,
            to,
            departureTime: depStr,
            arrivalTime: arrStr,
            duration,
            stops: Math.random() > 0.7 ? 1 : 0,
            price,
            class: 'Economy',
            refundable: Math.random() > 0.3,
            availableSeats: generateSeats('flight')
          });

          // Also a business class flight
          if (Math.random() > 0.5) {
            flightsToInsert.push({
              flightNumber: `${airline.code}-${flightCounter++}`,
              airline: airline.name,
              from,
              to,
              departureTime: depStr,
              arrivalTime: arrStr,
              duration,
              stops: 0,
              price: price * 2.5,
              class: 'Business',
              refundable: true,
              availableSeats: generateSeats('flight')
            });
          }
        }
      }
    }
    await Flight.insertMany(flightsToInsert);

    // 5. Trains
    console.log('Creating trains...');
    const trainsToInsert = [];
    let trainCounter = 12001;

    for (let from of cities) {
      for (let to of cities) {
        if (from === to) continue;

        for (let i = 0; i < 2; i++) {
          const trainName = trainNames[Math.floor(Math.random() * trainNames.length)];
          const depHour = Math.floor(Math.random() * 24);
          const depMin = [0, 30][Math.floor(Math.random() * 2)];
          const depStr = `${depHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;
          
          const duration = 480 + Math.floor(Math.random() * 960); // 8 to 24 hours
          const arrMinTotal = depHour * 60 + depMin + duration;
          const arrHour = Math.floor(arrMinTotal / 60) % 24;
          const arrMin = arrMinTotal % 60;
          const arrStr = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;

          const slPrice = 350 + Math.floor(Math.random() * 250);

          trainsToInsert.push({
            trainNumber: (trainCounter++).toString(),
            trainName: `${from === 'Delhi' || to === 'Delhi' ? 'NDLS' : from.substring(0, 3).toUpperCase()} ${trainName}`,
            from,
            to,
            departureTime: depStr,
            arrivalTime: arrStr,
            duration,
            prices: {
              Sleeper: slPrice,
              '3A': slPrice * 2.5,
              '2A': slPrice * 4,
              '1A': slPrice * 6
            },
            availableSeats: {
              Sleeper: 80 + Math.floor(Math.random() * 100),
              '3A': 30 + Math.floor(Math.random() * 50),
              '2A': 15 + Math.floor(Math.random() * 20),
              '1A': 5 + Math.floor(Math.random() * 10)
            },
            quota: ['General', 'Tatkal', 'Ladies']
          });
        }
      }
    }
    await Train.insertMany(trainsToInsert);

    // 6. Buses
    console.log('Creating buses...');
    const busesToInsert = [];
    let busCounter = 1000;

    for (let from of cities) {
      for (let to of cities) {
        if (from === to) continue;

        // Skip long distances (e.g. Delhi to Chennai/Bangalore/Goa is too far for standard bus, let's seed anyway for demonstration)
        for (let i = 0; i < 2; i++) {
          const operator = busOperators[Math.floor(Math.random() * busOperators.length)];
          const busType = ['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater'][Math.floor(Math.random() * 4)];
          
          const depHour = 17 + Math.floor(Math.random() * 6); // Evening/night: 17:00 to 23:00
          const depMin = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
          const depStr = `${(depHour % 24).toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;

          const duration = 300 + Math.floor(Math.random() * 420); // 5 to 12 hours
          const arrMinTotal = depHour * 60 + depMin + duration;
          const arrHour = Math.floor(arrMinTotal / 60) % 24;
          const arrMin = arrMinTotal % 60;
          const arrStr = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;

          let price = 500 + Math.floor(Math.random() * 1200);
          if (busType.includes('AC')) price += 400;
          if (busType.includes('Sleeper')) price += 300;

          const amenities = ['Water Bottle', 'Blanket'];
          if (busType.includes('AC')) amenities.push('WiFi', 'Charging Point');
          if (Math.random() > 0.5) amenities.push('Reading Light', 'CCTV');

          busesToInsert.push({
            busNumber: `BUS-${busCounter++}`,
            operator,
            busType,
            from,
            to,
            departureTime: depStr,
            arrivalTime: arrStr,
            duration,
            price,
            amenities,
            availableSeats: generateSeats('bus')
          });
        }
      }
    }
    await Bus.insertMany(busesToInsert);

    console.log('Database Seeding Completed Successfully!');
    return true;
  } catch (error) {
    console.error('Seeding failed:', error);
    return false;
  }
};

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;

