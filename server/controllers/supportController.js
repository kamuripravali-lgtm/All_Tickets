const { SupportTicket, Flight, Train, Bus, Coupon } = require('../models');

// Mock FAQs
const FAQS = [
  {
    q: "How do I cancel my ticket?",
    a: "Go to 'My Bookings', select the ticket you wish to cancel, and click the 'Cancel Ticket' button. Refunds will be processed to the original payment method within 3-5 business days."
  },
  {
    q: "What is Tatkal ticket booking quota?",
    a: "Tatkal booking opens daily at 10:00 AM for AC classes and 11:00 AM for Non-AC classes, offering last-minute bookings with premium fares."
  },
  {
    q: "Can I choose my seats in advance?",
    a: "Yes! During the booking process, after filling in passenger details, you will be shown an interactive seat map for flights, trains, or buses to pick your preferred seats."
  },
  {
    q: "What are the baggage rules for domestic flights?",
    a: "Most domestic airlines (Indigo, Air India, etc.) allow 15kg of check-in baggage and 7kg of hand baggage per passenger. Extra baggage can be added during online check-in."
  }
];

exports.getFAQs = (req, res) => {
  res.json(FAQS);
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const userEmail = req.user.email;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and Description are required' });
    }

    const ticket = await SupportTicket.create({
      ticketId: 'TCK-' + Math.floor(100000 + Math.random() * 900000),
      userEmail,
      subject,
      description,
      status: 'Open',
      messages: [
        { sender: 'User', content: description }
      ]
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userEmail: req.user.email });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.replyTicket = async (req, res) => {
  try {
    const { content, sender } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const messages = [...ticket.messages, { sender: sender || 'User', content }];
    const status = sender === 'Support' ? 'Open' : ticket.status; // Support replies keep open or change

    const updated = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { messages, status },
      { new: true }
    );

    // Simulated auto-reply from Admin Support if user replies
    if (sender !== 'Support') {
      setTimeout(async () => {
        const supportMessages = [...updated.messages, {
          sender: 'Support',
          content: 'Thank you for reaching out. We have received your update and our support executive is reviewing it. We will resolve your concern shortly.'
        }];
        await SupportTicket.findByIdAndUpdate(req.params.id, { messages: supportMessages });
      }, 2000);
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// AI Assistant natural query parsing
exports.aiAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const text = message.toLowerCase();
    let reply = "";
    let data = null;
    let action = null; // search-flight, search-train, search-bus, show-coupons, show-faqs

    // 1. Detect route endpoints (e.g. "from Delhi to Mumbai")
    let fromCity = "";
    let toCity = "";
    const citiesList = ['delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'goa'];
    
    // Check for "from X" and "to Y"
    const fromMatch = text.match(/from\s+([a-zA-Z]+)/);
    const toMatch = text.match(/to\s+([a-zA-Z]+)/);

    if (fromMatch && citiesList.includes(fromMatch[1])) {
      fromCity = fromMatch[1].charAt(0).toUpperCase() + fromMatch[1].slice(1);
    }
    if (toMatch && citiesList.includes(toMatch[1])) {
      toCity = toMatch[1].charAt(0).toUpperCase() + toMatch[1].slice(1);
    }

    // Fallback search directly in sentence
    if (!fromCity || !toCity) {
      const foundCities = citiesList.filter(c => text.includes(c));
      if (foundCities.length >= 2) {
        // e.g. "delhi to mumbai flight" -> index-based ordering
        const idx1 = text.indexOf(foundCities[0]);
        const idx2 = text.indexOf(foundCities[1]);
        if (idx1 < idx2) {
          fromCity = foundCities[0].charAt(0).toUpperCase() + foundCities[0].slice(1);
          toCity = foundCities[1].charAt(0).toUpperCase() + foundCities[1].slice(1);
        } else {
          fromCity = foundCities[1].charAt(0).toUpperCase() + foundCities[1].slice(1);
          toCity = foundCities[0].charAt(0).toUpperCase() + foundCities[0].slice(1);
        }
      }
    }

    // 2. Classify Transport Type
    const isFlight = text.includes('flight') || text.includes('plane') || text.includes('fly');
    const isTrain = text.includes('train') || text.includes('rail') || text.includes('irctc');
    const isBus = text.includes('bus') || text.includes('coach');
    const isCoupon = text.includes('coupon') || text.includes('offer') || text.includes('discount') || text.includes('promo');

    // 3. Formulate responses based on query
    if (fromCity && toCity) {
      if (isFlight) {
        const flights = await Flight.find({
          from: { $regex: `^${fromCity}$`, $options: 'i' },
          to: { $regex: `^${toCity}$`, $options: 'i' }
        });
        flights.sort((a, b) => a.price - b.price);

        if (flights.length > 0) {
          const cheapest = flights[0];
          reply = `✈️ I found **${flights.length} flights** from **${fromCity} to ${toCity}**. The cheapest is with **${cheapest.airline}** (${cheapest.flightNumber}) departing at **${cheapest.departureTime}** for **₹${cheapest.price}**.`;
          action = 'search-flight';
          data = { from: fromCity, to: toCity, type: 'flight' };
        } else {
          reply = `✈️ Sorry, I couldn't find any direct flights from **${fromCity} to ${toCity}** in our catalog.`;
        }
      } else if (isTrain) {
        const trains = await Train.find({
          from: { $regex: `^${fromCity}$`, $options: 'i' },
          to: { $regex: `^${toCity}$`, $options: 'i' }
        });
        trains.sort((a, b) => a.prices.Sleeper - b.prices.Sleeper);

        if (trains.length > 0) {
          const cheapest = trains[0];
          reply = `🚆 I found **${trains.length} trains** between **${fromCity} and ${toCity}**. **${cheapest.trainName}** (${cheapest.trainNumber}) departs at **${cheapest.departureTime}** with Sleeper tickets starting at **₹${cheapest.prices.Sleeper}**.`;
          action = 'search-train';
          data = { from: fromCity, to: toCity, type: 'train' };
        } else {
          reply = `🚆 I couldn't find any trains running between **${fromCity} and ${toCity}**.`;
        }
      } else if (isBus || text.includes('travel')) {
        const buses = await Bus.find({
          from: { $regex: `^${fromCity}$`, $options: 'i' },
          to: { $regex: `^${toCity}$`, $options: 'i' }
        });
        buses.sort((a, b) => a.price - b.price);

        if (buses.length > 0) {
          const cheapest = buses[0];
          reply = `🚌 I found **${buses.length} buses** from **${fromCity} to ${toCity}**. **${cheapest.operator}** (${cheapest.busType}) departing at **${cheapest.departureTime}** is the cheapest at **₹${cheapest.price}**.`;
          action = 'search-bus';
          data = { from: fromCity, to: toCity, type: 'bus' };
        } else {
          reply = `🚌 No buses found operating between **${fromCity} and ${toCity}**.`;
        }
      } else {
        reply = `I see you are looking for travel between **${fromCity} and ${toCity}**. Please specify if you want to search for a **flight** ✈️, **train** 🚆, or **bus** 🚌.`;
      }
    } else if (isCoupon) {
      const coupons = await Coupon.find({ isActive: true });
      const couponList = coupons.map(c => `**${c.code}**: ${c.description}`).join('\n');
      reply = `🏷️ Here are the active promo offers available on **TripEase**:\n\n${couponList}\n\nYou can apply these on the checkout screen!`;
      action = 'show-coupons';
    } else if (text.includes('cancel') || text.includes('refund')) {
      reply = `ℹ️ You can cancel any booking under **My Bookings**. Locate your upcoming trip and select **Cancel Ticket**. Refunds are calculated instantly and returned within 3-5 days.`;
      action = 'show-faqs';
    } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      reply = `Hello! I am your **TripEase AI Travel Assistant** 🤖. I can help you search, compare, and book tickets.\n\nTry asking me: \n* *"Find the cheapest flight from Delhi to Mumbai"* \n* *"Show me coupons"* \n* *"Suggest a train from Bangalore to Goa"*`;
    } else {
      reply = `I'm not sure how to help with that request. You can ask me to find flights, trains, or buses between cities, ask about refund policies, or view discount coupons! E.g. *"Show flights from Bangalore to Chennai"*`;
    }

    res.json({ reply, action, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
