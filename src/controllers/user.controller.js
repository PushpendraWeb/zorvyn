const bcrypt = require('bcryptjs');
const Users = require('../model/users.model');
const Roles = require('../model/roles.model');
const Counter = require('../model/counter.model');
const { PERMISSIONS } = require('../model/roles.model');

function isValidPermissionArray(value) {
  if (!Array.isArray(value)) return false;
  return value.every((p) => PERMISSIONS.includes(p));
}

const getAllUsersController = async (req, res) => {
  try {
    const users = await Users.find({ DeletedAt: null }).select('-password').sort({ user_id: 1 });
    return res.status(200).json({ success: true, message: 'Users fetched successfully', data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const user = await Users.findOne({ user_id: userId, DeletedAt: null });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

const getUserByAuthController = async (req, res) => {
  try {
    const userId = req.user.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await Users.findOne({ user_id: userId, DeletedAt: null }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const userId = req.user.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, username, password, role_id, status } = req.body || {};

    if (role_id !== undefined && role_id !== null) {
      const role = await Roles.findOne({ role_id: Number(role_id), DeletedAt: null, status: true });
      if (!role) return res.status(400).json({ success: false, message: 'Invalid role_id' });
    }

    const updateData = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(username !== undefined && { username: String(username).trim() }),
      ...(role_id !== undefined && role_id !== null && { role_id: Number(role_id) }),
      ...(status !== undefined && { status: Boolean(status) }),
      ...(req.user?.user_id ? { updatedBy: req.user.user_id } : {}),
    };

    if (password !== undefined && password !== null && String(password).length > 0) {
      updateData.password = await bcrypt.hash(String(password), 10);
    }

    const updated = await Users.findOneAndUpdate({ user_id: userId, DeletedAt: null }, updateData, { new: true })
      .select('-password');

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'User updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

const createUserController = async (req, res) => {
  try {
    const { name, username, password, role_id, status = true } = req.body || {};

    if (!name || !username || !password || role_id === undefined || role_id === null) {
      return res.status(400).json({
        success: false,
        message: 'name, username, password, and role_id are required',
      });
    }

    const existing = await Users.findOne({ username: String(username).trim(), DeletedAt: null });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const role = await Roles.findOne({ role_id: Number(role_id), DeletedAt: null, status: true });
    if (!role) {
      return res.status(400).json({ success: false, message: 'Invalid role_id' });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    const createdBy = req.user?.user_id || null;
    const maxUser = await Users.findOne({ DeletedAt: null }).sort({ user_id: -1 }).select('user_id').lean();
    const userId = await Counter.getNextSequence('Users', maxUser?.user_id || 0);

    const user = new Users({
      user_id: userId,
      name: String(name).trim(),
      username: String(username).trim(),
      password: hashed,
      role_id: Number(role_id),
      status: Boolean(status),
      createdBy,
    });

    const saved = await user.save();
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user_id: saved.user_id,
        name: saved.name,
        username: saved.username,
        role_id: saved.role_id,
        status: saved.status,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const DeletedBy = req.user?.user_id || null;

    const deleted = await Users.findOneAndUpdate(
      { user_id: userId, DeletedAt: null },
      { status: false, DeletedBy, DeletedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'User deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

const deleteUserByAuthController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const deleted = await Users.findOneAndUpdate(
      { user_id: userId, DeletedAt: null },
      { status: false, DeletedBy: userId, DeletedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'User deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

// Set per-user permissions (overrides role permissions when non-empty)
const setUserPermissionsController = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return res.status(400).json({ success: false, message: 'Invalid user id' });

    const { permissions } = req.body || {};
    if (permissions === undefined) {
      return res.status(400).json({ success: false, message: 'permissions is required (array). Use [] to clear.' });
    }
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'permissions must be an array' });
    }
    if (permissions.length > 0 && !isValidPermissionArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: `permissions must be an array of: ${PERMISSIONS.join(', ')}`,
      });
    }

    const updatedBy = req.user?.user_id || null;
    const updated = await Users.findOneAndUpdate(
      { user_id: userId, DeletedAt: null },
      {
        permissions: permissions.length > 0 ? permissions : undefined,
        ...(updatedBy ? { updatedBy } : {}),
      },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      message: 'User permissions updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error setting user permissions:', error);
    return res.status(500).json({ success: false, message: 'Failed to set permissions', error: error.message });
  }
};

module.exports = {
  getAllUsersController,
  getUserByIdController,
  getUserByAuthController,
  createUserController,
  updateUserController,
  deleteUserController,
  deleteUserByAuthController,
  setUserPermissionsController,
};

