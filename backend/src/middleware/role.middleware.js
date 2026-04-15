const { sendError } = require('../utils/response');

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden, insufficient permissions');
    }
    next();
  };
};

module.exports = { requireRole };
