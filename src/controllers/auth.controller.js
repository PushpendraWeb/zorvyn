const bcrypt = require('bcryptjs');
const Users = require('../model/users.model');
const Roles = require('../model/roles.model');
const { generateToken } = require('../utils/jwt.utils');

const registerController = async (req, res) => {
  try {
    const { name, username, password, role_id, status = true } = req.body || {};

    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, username, and password are required',
      });
    }
    if (role_id !== undefined && role_id !== null) {
      return res.status(400).json({
        success: false,
        message: 'role_id cannot be provided during public registration. Use /api/users/create as an authenticated admin to assign roles.',
      });
    }

    let defaultRole = await Roles.findOne({ name: 'Viewer', DeletedAt: null, status: true });
    if (!defaultRole) {
      defaultRole = new Roles({ name: 'Viewer', permissions: ['View'], status: true });
      await defaultRole.save();
    }

    const hashed = await bcrypt.hash(String(password), 10);

    const user = new Users({
      name: String(name).trim(),
      username: String(username).trim(),
      password: hashed,
      role_id: Number(defaultRole.role_id),
      status: Boolean(status),
      createdBy: null,
    });

    const saved = await user.save();
    const token = generateToken({ user_id: saved.user_id, username: saved.username, role_id: saved.role_id });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id: saved.user_id,
        name: saved.name,
        username: saved.username,
        role_id: saved.role_id,
        status: saved.status,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: 'Failed to register', error: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password are required' });
    }

    const user = await Users.findOne({ username: String(username).trim(), DeletedAt: null });
    if (!user || !user.status) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(String(password), user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken({ user_id: user.user_id, username: user.username, role_id: user.role_id });
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        role_id: user.role_id,
        status: user.status,
      },
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ success: false, message: 'Failed to login', error: error.message });
  }
};

const forgetPasswordController = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and new password are required' });
    }

    const user = await Users.findOne({ username: String(username).trim(), DeletedAt: null });
    if (!user || !user.status) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user_id: user.user_id,
        username: user.username,
        password: user.password,
      },
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

module.exports = { registerController, loginController, forgetPasswordController };

