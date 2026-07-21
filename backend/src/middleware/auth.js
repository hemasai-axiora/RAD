const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired access token' });
    }
    req.user = user;
    next();
  });
}

function checkPermission(module, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { permissions, roleName } = req.user;

    // Super Admin has full permissions
    if (permissions && permissions.all === true) {
      return next();
    }

    // Check if permission exists for the module and action
    if (permissions && permissions[module] && permissions[module].includes(action)) {
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: `Access denied. Role ${roleName} does not have ${action} permission on module: ${module}.` 
    });
  };
}

module.exports = {
  authenticateToken,
  checkPermission,
};
