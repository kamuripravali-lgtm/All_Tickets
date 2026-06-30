const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7, authHeader.length) 
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'No token found in Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tripease_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

module.exports = { auth, adminOnly };
