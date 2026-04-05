const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize.middleware');

const guard = (permission) => authorize(permission);
const createGuard = authorize('Create');
const viewGuard = authorize('View');
const updateGuard = authorize('Update');
const deleteGuard = authorize('Delete');

const deleteSelfOrAdminGuard = async (req, res, next) => {
  if (!req.user || req.user.user_id === undefined || req.user.user_id === null) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const targetId = Number(req.params.id);
  if (Number.isNaN(targetId)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  if (Number(req.user.user_id) === targetId) {
    return next();
  }

  return authorize('Delete')(req, res, next);
};

module.exports = {
  auth,
  guard,
  createGuard,
  viewGuard,
  updateGuard,
  deleteGuard,
  deleteSelfOrAdminGuard,
};
