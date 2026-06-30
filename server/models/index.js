const mongooseModels = require('./mongooseModels');
const mockModels = require('./mockModels');

const getModels = () => {
  const mode = process.env.DATABASE_MODE || 'local';
  if (mode === 'mongodb') {
    return mongooseModels;
  } else {
    return mockModels;
  }
};

module.exports = getModels();
