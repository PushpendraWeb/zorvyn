const { verifyToken } = require('../utils/jwt.utils');
const Users = require('../model/users.model');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing (Bearer token required)',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.user_id === undefined || decoded.user_id === null) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }

    const user = await Users.findOne({
      user_id: Number(decoded.user_id),
      DeletedAt: null,
      status: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    req.user = {
      user_id: user.user_id,
      username: user.username,
      role_id: user.role_id,
      permissions: Array.isArray(user.permissions) ? user.permissions : null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Unauthorized',
    });
  }
}

module.exports = auth;

