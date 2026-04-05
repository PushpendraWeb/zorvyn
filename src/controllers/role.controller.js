const Counter = require('../model/counter.model');
const Roles = require('../model/roles.model');
const { PERMISSIONS } = require('../model/roles.model');

function getAuthUserId(req) {
  return req.user && req.user.user_id ? req.user.user_id : null;
}

function isValidPermissionArray(value) {
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  return value.every((p) => PERMISSIONS.includes(p));
}

// CREATE
const createRoleController = async (req, res) => {
  try {
    const { name, permissions, status = true } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'name is required',
      });
    }

    if (!isValidPermissionArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: `permissions must be an array of: ${PERMISSIONS.join(', ')}`,
      });
    }

    const createdBy = getAuthUserId(req);
    const maxRole = await Roles.findOne({ DeletedAt: null }).sort({ role_id: -1 }).select('role_id').lean();
    const roleId = await Counter.getNextSequence('Roles', maxRole?.role_id || 0);

    const role = new Roles({
      role_id: roleId,
      name: name.trim(),
      permissions: permissions !== undefined ? permissions : undefined,
      status,
      createdBy,
    });

    const saved = await role.save();

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message,
    });
  }
};

// UPDATE
const updateRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = Number(id);
    if (Number.isNaN(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const { name, permissions, status } = req.body || {};

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({
        success: false,
        message: 'name must be a non-empty string',
      });
    }

    if (!isValidPermissionArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: `permissions must be an array of: ${PERMISSIONS.join(', ')}`,
      });
    }

    const updatedBy = getAuthUserId(req);

    const updateData = {
      ...(name !== undefined && { name: name.trim() }),
      ...(permissions !== undefined && { permissions }),
      ...(status !== undefined && { status }),
      ...(updatedBy !== null && { updatedBy }),
    };

    const updated = await Roles.findOneAndUpdate(
      { role_id: roleId, DeletedAt: null },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message,
    });
  }
};

// DELETE (soft)
const deleteRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = Number(id);
    if (Number.isNaN(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const DeletedBy = getAuthUserId(req);

    const deleted = await Roles.findOneAndUpdate(
      { role_id: roleId, DeletedAt: null },
      {
        status: false,
        DeletedBy,
        DeletedAt: new Date(),
      },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message,
    });
  }
};

// GET BY ID
const getRoleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const roleId = Number(id);
    if (Number.isNaN(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const role = await Roles.findOne({ role_id: roleId, DeletedAt: null });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Role fetched successfully',
      data: role,
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message,
    });
  }
};

// GET ALL
const getAllRolesController = async (req, res) => {
  try {
    const roles = await Roles.find({ DeletedAt: null }).sort({ role_id: 1 });
    return res.status(200).json({
      success: true,
      message: 'Roles fetched successfully',
      data: roles,
      count: roles.length,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message,
    });
  }
};

module.exports = {
  createRoleController,
  updateRoleController,
  deleteRoleController,
  getRoleByIdController,
  getAllRolesController,
};

