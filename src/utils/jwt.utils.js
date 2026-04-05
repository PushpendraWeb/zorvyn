const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    console.log(token);
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Decode token without verification (for getting user info)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

// Check token status (expired, valid, invalid)
const checkTokenStatus = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      expired: false,
      decoded: decoded,
      message: 'Token is valid'
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        expired: true,
        decoded: null,
        message: 'Token has expired',
        expiredAt: error.expiredAt
      };
    } else if (error.name === 'JsonWebTokenError') {
      return {
        valid: false,
        expired: false,
        decoded: null,
        message: 'Invalid token'
      };
    } else {
      return {
        valid: false,
        expired: false,
        decoded: null,
        message: 'Token verification failed'
      };
    }
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  checkTokenStatus
}; 