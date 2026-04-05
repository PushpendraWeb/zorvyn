const express = require('express');
const { auth, createGuard, viewGuard, updateGuard, deleteGuard } = require('../../guards/guards');
const {
  createFinancialRecordsCategoryController,
  updateFinancialRecordsCategoryController,
  deleteFinancialRecordsCategoryController,
  getFinancialRecordsCategoryByIdController,
  getAllFinancialRecordsCategoriesController,
} = require('../../controllers/financialRecordsCategory.controller');

const router = express.Router();

router.post('/create', auth, createGuard, createFinancialRecordsCategoryController);
router.put('/update/:id', auth, updateGuard, updateFinancialRecordsCategoryController);
router.delete('/delete/:id', auth, deleteGuard, deleteFinancialRecordsCategoryController);
router.get('/getbyid/:id', auth, viewGuard, getFinancialRecordsCategoryByIdController);
router.get('/getall', getAllFinancialRecordsCategoriesController);

module.exports = router;

