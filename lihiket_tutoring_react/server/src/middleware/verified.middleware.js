/**
 * Block deactivated accounts.
 * Must be placed after `protect` middleware.
 * Note: isVerified check removed — users login directly after registration.
 */
const requireVerified = (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      code:    'ACCOUNT_DEACTIVATED',
      message: 'Your account has been deactivated. Please contact support.',
    });
  }
  next();
};

module.exports = { requireVerified };
