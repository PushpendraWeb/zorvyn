const Roles = require('../model/roles.model');

const ROLE_ID_RULES = {
  1: ['View'],
  2: ['View'],
  3: ['View', 'Create', 'Update', 'Delete', 'Edit'],
};

function authorize(requiredPermission) {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role_id === undefined || req.user.role_id === null) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const role = await Roles.findOne({
        role_id: Number(req.user.role_id),
        DeletedAt: null,
        status: true,
      });

      if (!role) {
        return res.status(403).json({ success: false, message: 'Role not found or inactive' });
      }

      const roleId = Number(role.role_id);
      const rolePerms = Array.isArray(role.permissions) ? role.permissions : [];
      const userPerms =
        req.user && Array.isArray(req.user.permissions) && req.user.permissions.length > 0
          ? req.user.permissions
          : null;
      const permsToUse = userPerms || ROLE_ID_RULES[roleId] || rolePerms;

      if (!permsToUse.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: missing permission ${requiredPermission}`,
        });
      }

      req.role = { role_id: role.role_id, name: role.name, permissions: rolePerms };
      req.permissions = permsToUse;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message,
      });
    }
  };
}

module.exports = authorize;

