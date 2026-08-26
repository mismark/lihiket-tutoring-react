/**
 * Block any user whose account has not been approved by an admin.
 * Must be placed after `protect` middleware.
 */
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval.',
    });
  }
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated.',
    });
  }
  next();
};

module.exports = { requireVerified };
