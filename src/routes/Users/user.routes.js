const express = require('express');
const { auth, createGuard, viewGuard, updateGuard, deleteGuard, deleteSelfOrAdminGuard } = require('../../guards/guards');
const {
  getAllUsersController,
  getUserByIdController,
  getUserByAuthController,
  createUserController,
  updateUserController,
  deleteUserController,
  deleteUserByAuthController,
  setUserPermissionsController,
} = require('../../controllers/user.controller');

const router = express.Router();

router.post('/create', createUserController);
router.get('/getall', auth, viewGuard, getAllUsersController);
router.get('/getbyid/:id', auth, viewGuard, getUserByIdController);
router.get('/getbyauth', auth, getUserByAuthController);
router.put('/update', auth, updateUserController);
router.put('/permissions/:id', auth, updateGuard, setUserPermissionsController);
router.delete('/delete', auth, deleteUserByAuthController);
router.delete('/delete/:id', auth, deleteSelfOrAdminGuard, deleteUserController);

module.exports = router;

