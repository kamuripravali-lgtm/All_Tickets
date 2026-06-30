const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

const readDB = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      const initialData = {
        users: [],
        flights: [],
        trains: [],
        buses: [],
        bookings: [],
        coupons: [],
        supportTickets: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local db.json', err);
    return {};
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to local db.json', err);
  }
};

const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

const matchesQuery = (item, query) => {
  if (!query) return true;
  for (let key in query) {
    const val = query[key];
    if (val && typeof val === 'object' && val.$regex) {
      const regex = new RegExp(val.$regex, val.$options || 'i');
      if (!regex.test(item[key])) return false;
    } else if (key === '$or') {
      let matchAny = false;
      for (let subQuery of val) {
        if (matchesQuery(item, subQuery)) {
          matchAny = true;
          break;
        }
      }
      if (!matchAny) return false;
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
};

class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const db = readDB();
    const items = db[this.collectionName] || [];
    return items.filter(item => matchesQuery(item, query));
  }

  async findOne(query = {}) {
    const db = readDB();
    const items = db[this.collectionName] || [];
    const found = items.find(item => matchesQuery(item, query));
    return found || null;
  }

  async findById(id) {
    const db = readDB();
    const items = db[this.collectionName] || [];
    const found = items.find(item => item._id === id || item.id === id);
    return found || null;
  }

  async create(data) {
    const db = readDB();
    const newItem = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...data
    };
    if (!db[this.collectionName]) {
      db[this.collectionName] = [];
    }
    db[this.collectionName].push(newItem);
    writeDB(db);
    return newItem;
  }

  async findByIdAndUpdate(id, updates = {}, options = {}) {
    const db = readDB();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = {
      ...items[index],
      ...updates
    };
    
    items[index] = updatedItem;
    db[this.collectionName] = items;
    writeDB(db);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    const db = readDB();
    const items = db[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id || item.id === id);
    
    if (index === -1) return null;
    
    const deletedItem = items[index];
    items.splice(index, 1);
    db[this.collectionName] = items;
    writeDB(db);
    return deletedItem;
  }

  async countDocuments(query = {}) {
    const db = readDB();
    const items = db[this.collectionName] || [];
    return items.filter(item => matchesQuery(item, query)).length;
  }

  // Helper for deleting all (useful for seeding)
  async deleteMany(query = {}) {
    const db = readDB();
    if (Object.keys(query).length === 0) {
      db[this.collectionName] = [];
    } else {
      db[this.collectionName] = (db[this.collectionName] || []).filter(item => !matchesQuery(item, query));
    }
    writeDB(db);
    return { deletedCount: db[this.collectionName].length };
  }
  
  async insertMany(arr) {
    const db = readDB();
    const newItems = arr.map(item => ({
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...item
    }));
    if (!db[this.collectionName]) {
      db[this.collectionName] = [];
    }
    db[this.collectionName].push(...newItems);
    writeDB(db);
    return newItems;
  }
}

module.exports = {
  User: new MockModel('users'),
  Flight: new MockModel('flights'),
  Train: new MockModel('trains'),
  Bus: new MockModel('buses'),
  Booking: new MockModel('bookings'),
  Coupon: new MockModel('coupons'),
  SupportTicket: new MockModel('supportTickets')
};
