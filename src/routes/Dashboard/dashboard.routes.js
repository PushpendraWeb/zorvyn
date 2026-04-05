const express = require('express');
const { auth, viewGuard } = require('../../guards/guards');
const { getDashboardSummaryController } = require('../../controllers/dashboard.controller');

const router = express.Router();

router.get('/summary', auth, viewGuard, getDashboardSummaryController);

module.exports = router;

