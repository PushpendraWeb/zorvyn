const express = require('express');
const { registerController, loginController, forgetPasswordController } = require('../../controllers/auth.controller');

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/forgetpassword', forgetPasswordController);

module.exports = router;

