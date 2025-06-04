const jwt = require('jsonwebtoken');
const UserModel = require('../model/user.model');


// Generic auth middleware (just verifies token & user)
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers['authorization']; // Bearer <token>

    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Manager-only auth middleware
const managerAuth = async (req, res, next) => {

  try {
    const token = req.headers["authorization"]// "Bearer <token>"
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (!user || user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied. Only managers can create projects.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware, managerAuth };
