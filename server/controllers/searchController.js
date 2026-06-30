const { Flight, Train, Bus } = require('../models');

// Help cities list for autocompletion
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Goa'];

exports.getCities = async (req, res) => {
  res.json(CITIES);
};

exports.searchFlights = async (req, res) => {
  try {
    const { from, to, date, cabinClass } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }

    // Find routes matching from/to
    // (Note: in local mode, we ignore date filter to ensure demo always returns results, but in production we can track it)
    const query = {
      from: { $regex: `^${from}$`, $options: 'i' },
      to: { $regex: `^${to}$`, $options: 'i' }
    };

    if (cabinClass) {
      query.class = cabinClass;
    }

    let flights = await Flight.find(query);

    // Apply filters from query params
    const { airline, stops, maxPrice, timeOfDay, refundable, sortBy } = req.query;

    if (airline) {
      const selectedAirlines = airline.split(',');
      flights = flights.filter(f => selectedAirlines.includes(f.airline));
    }

    if (stops !== undefined && stops !== '') {
      flights = flights.filter(f => f.stops === parseInt(stops));
    }

    if (maxPrice) {
      flights = flights.filter(f => f.price <= parseInt(maxPrice));
    }

    if (refundable === 'true') {
      flights = flights.filter(f => f.refundable === true);
    }

    if (timeOfDay) {
      // morning, afternoon, night
      flights = flights.filter(f => {
        const hour = parseInt(f.departureTime.split(':')[0]);
        if (timeOfDay.includes('morning') && hour >= 6 && hour < 12) return true;
        if (timeOfDay.includes('afternoon') && hour >= 12 && hour < 18) return true;
        if (timeOfDay.includes('night') && (hour >= 18 || hour < 6)) return true;
        return false;
      });
    }

    // Apply Sorting
    if (sortBy === 'lowestPrice') {
      flights.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'fastest') {
      flights.sort((a, b) => a.duration - b.duration);
    } else if (sortBy === 'earliest') {
      flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    res.json(flights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchTrains = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }

    const query = {
      from: { $regex: `^${from}$`, $options: 'i' },
      to: { $regex: `^${to}$`, $options: 'i' }
    };

    let trains = await Train.find(query);

    const { trainClass, quota, sortBy } = req.query;

    if (trainClass) {
      // Filter trains that have pricing/seats for the specified class
      trains = trains.filter(t => t.prices[trainClass] !== undefined);
    }

    if (quota) {
      trains = trains.filter(t => t.quota.includes(quota));
    }

    // Sort Trains
    if (sortBy === 'lowestPrice' && trainClass) {
      trains.sort((a, b) => a.prices[trainClass] - b.prices[trainClass]);
    } else if (sortBy === 'fastest') {
      trains.sort((a, b) => a.duration - b.duration);
    } else {
      // Sort by departure time as default
      trains.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    res.json(trains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchBuses = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'From and To cities are required' });
    }

    const query = {
      from: { $regex: `^${from}$`, $options: 'i' },
      to: { $regex: `^${to}$`, $options: 'i' }
    };

    let buses = await Bus.find(query);

    const { busType, operator, maxPrice, sortBy } = req.query;

    if (busType) {
      const types = busType.split(',');
      buses = buses.filter(b => types.some(t => b.busType.includes(t)));
    }

    if (operator) {
      const operators = operator.split(',');
      buses = buses.filter(b => operators.includes(b.operator));
    }

    if (maxPrice) {
      buses = buses.filter(b => b.price <= parseInt(maxPrice));
    }

    // Sort buses
    if (sortBy === 'lowestPrice') {
      buses.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'fastest') {
      buses.sort((a, b) => a.duration - b.duration);
    } else {
      buses.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
