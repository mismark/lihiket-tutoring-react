const jwt = require('jsonwebtoken');
const config = require('../config/index');

/**
 * @param {Object} payload - { id, role, collection }
 * @returns {string} signed JWT
 */
const generateToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpire });

module.exports = generateToken;
