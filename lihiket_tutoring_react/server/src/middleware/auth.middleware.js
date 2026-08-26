const jwt = require('jsonwebtoken');
const config = require('../config/index');

// Model map — keyed by the collection field stored in JWT payload
const models = {
  admins:   () => require('../models/Admin'),
  teachers: () => require('../models/Teacher'),
  students: () => require('../models/Student'),
  parents:  () => require('../models/Parent'),
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Fallback: token in query string (used for iframe/file viewer src)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const Model = models[decoded.collection]?.();

    if (!Model) {
      return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    const user = await Model.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    req.userRole = decoded.role;
    req.userCollection = decoded.collection;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
