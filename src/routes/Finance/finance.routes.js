const express = require('express');
const { auth, createGuard, viewGuard, updateGuard, deleteGuard } = require('../../guards/guards');
const {
  createFinanceRecordController,
  updateFinanceRecordController,
  deleteFinanceRecordController,
  getFinanceRecordByIdController,
  getAllFinanceRecordsController,
} = require('../../controllers/finance.controller');

const router = express.Router();

router.post('/create', auth, createGuard, createFinanceRecordController);
router.put('/update/:id', auth, updateGuard, updateFinanceRecordController);
router.delete('/delete/:id', auth, deleteGuard, deleteFinanceRecordController);
router.get('/getbyid/:id', auth, viewGuard, getFinanceRecordByIdController);
router.get('/getall', auth, viewGuard, getAllFinanceRecordsController);
router.get('/filterFinanceRecords', auth, viewGuard, getAllFinanceRecordsController);

module.exports = router;

