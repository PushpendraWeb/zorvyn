const express = require('express');
const { auth, createGuard, viewGuard, updateGuard, deleteGuard } = require('../../guards/guards');
const {
  createRoleController,
  updateRoleController,
  deleteRoleController,
  getRoleByIdController,
  getAllRolesController,
} = require('../../controllers/role.controller');

const router = express.Router();

router.post('/create', auth, createGuard, createRoleController);
router.put('/update/:id', auth, updateGuard, updateRoleController);
router.delete('/delete/:id', auth, deleteGuard, deleteRoleController);
router.get('/getbyid/:id', auth, viewGuard, getRoleByIdController);
router.get('/getall', getAllRolesController);

module.exports = router;

