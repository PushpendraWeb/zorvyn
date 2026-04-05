const Counter = require('../model/counter.model');
const FinanceRecord = require('../model/financeRecord.model');
const { TYPES } = require('../model/financeRecord.model');
const FinancialRecordsCategory = require('../model/financialRecordsCategory.model');

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const createFinanceRecordController = async (req, res) => {
  try {
    const { amount, type, financial_records_category_id, category, date, notes = '', status = true } = req.body || {};

    if (amount === undefined || amount === null || Number(amount) === 0) {
      return res.status(400).json({ success: false, message: 'amount is required' });
    }
    if (!type || !TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${TYPES.join(', ')}` });
    }

    let categoryDoc = null;
    if (financial_records_category_id !== undefined && financial_records_category_id !== null) {
      const cid = Number(financial_records_category_id);
      if (Number.isNaN(cid)) {
        return res.status(400).json({ success: false, message: 'financial_records_category_id must be a number' });
      }
      categoryDoc = await FinancialRecordsCategory.findOne({
        financial_records_category_id: cid,
        DeletedAt: null,
        status: true,
      });
    } else if (category && typeof category === 'string' && category.trim()) {
      categoryDoc = await FinancialRecordsCategory.findOne({
        name: category.trim(),
        DeletedAt: null,
        status: true,
      });
    }

    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Valid financial_records_category_id is required (or provide category name that exists)',
      });
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ success: false, message: 'date must be a valid date' });
    }

    const createdBy = req.user?.user_id || null;
    const maxRecord = await FinanceRecord.findOne({ DeletedAt: null }).sort({ record_id: -1 }).select('record_id').lean();
    const recordId = await Counter.getNextSequence('FinanceRecord', maxRecord?.record_id || 0);

    const record = new FinanceRecord({
      record_id: recordId,
      amount: Number(amount),
      type,
      financial_records_category_id: categoryDoc.financial_records_category_id,
      category: categoryDoc.name,
      date: parsedDate,
      notes: String(notes || '').trim(),
      status: Boolean(status),
      createdBy,
    });

    const saved = await record.save();
    return res.status(201).json({ success: true, message: 'Record created successfully', data: saved });
  } catch (error) {
    console.error('Error creating record:', error);
    return res.status(500).json({ success: false, message: 'Failed to create record', error: error.message });
  }
};

const updateFinanceRecordController = async (req, res) => {
  try {
    const recordId = Number(req.params.id);
    if (Number.isNaN(recordId)) return res.status(400).json({ success: false, message: 'Invalid record id' });

    const { amount, type, financial_records_category_id, category, date, notes, status } = req.body || {};

    if (type !== undefined && !TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${TYPES.join(', ')}` });
    }
    if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
      return res.status(400).json({ success: false, message: 'category must be a non-empty string' });
    }
    if (date !== undefined) {
      const parsed = parseDate(date);
      if (!parsed) return res.status(400).json({ success: false, message: 'date must be a valid date' });
    }

    let categoryDoc = null;
    if (financial_records_category_id !== undefined && financial_records_category_id !== null) {
      const cid = Number(financial_records_category_id);
      if (Number.isNaN(cid)) {
        return res.status(400).json({ success: false, message: 'financial_records_category_id must be a number' });
      }
      categoryDoc = await FinancialRecordsCategory.findOne({
        financial_records_category_id: cid,
        DeletedAt: null,
        status: true,
      });
      if (!categoryDoc) {
        return res.status(400).json({ success: false, message: 'Invalid financial_records_category_id' });
      }
    } else if (category !== undefined) {
      categoryDoc = await FinancialRecordsCategory.findOne({
        name: String(category).trim(),
        DeletedAt: null,
        status: true,
      });
      if (!categoryDoc) {
        return res.status(400).json({ success: false, message: 'Category name not found' });
      }
    }

    const updateData = {
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(type !== undefined && { type }),
      ...(categoryDoc && {
        financial_records_category_id: categoryDoc.financial_records_category_id,
        category: categoryDoc.name,
      }),
      ...(date !== undefined && { date: parseDate(date) }),
      ...(notes !== undefined && { notes: String(notes || '').trim() }),
      ...(status !== undefined && { status: Boolean(status) }),
      ...(req.user?.user_id ? { updatedBy: req.user.user_id } : {}),
    };

    const updated = await FinanceRecord.findOneAndUpdate(
      { record_id: recordId, DeletedAt: null },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
    return res.status(200).json({ success: true, message: 'Record updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating record:', error);
    return res.status(500).json({ success: false, message: 'Failed to update record', error: error.message });
  }
};

const deleteFinanceRecordController = async (req, res) => {
  try {
    const recordId = Number(req.params.id);
    if (Number.isNaN(recordId)) return res.status(400).json({ success: false, message: 'Invalid record id' });

    const DeletedBy = req.user?.user_id || null;
    const deleted = await FinanceRecord.findOneAndUpdate(
      { record_id: recordId, DeletedAt: null },
      { status: false, DeletedBy, DeletedAt: new Date() },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ success: false, message: 'Record not found' });
    return res.status(200).json({ success: true, message: 'Record deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting record:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete record', error: error.message });
  }
};

const getFinanceRecordByIdController = async (req, res) => {
  try {
    const recordId = Number(req.params.id);
    if (Number.isNaN(recordId)) return res.status(400).json({ success: false, message: 'Invalid record id' });

    const record = await FinanceRecord.findOne({ record_id: recordId, DeletedAt: null });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    return res.status(200).json({ success: true, message: 'Record fetched successfully', data: record });
  } catch (error) {
    console.error('Error fetching record:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch record', error: error.message });
  }
};

const getAllFinanceRecordsController = async (req, res) => {
  try {
    const { type, category, financial_records_category_id, from, to } = req.query || {};

    const query = { DeletedAt: null };
    if (type) {
      if (!TYPES.includes(String(type))) {
        return res.status(400).json({ success: false, message: `type must be one of: ${TYPES.join(', ')}` });
      }
      query.type = String(type);
    }
    if (financial_records_category_id !== undefined && financial_records_category_id !== null) {
      const cid = Number(financial_records_category_id);
      if (Number.isNaN(cid)) {
        return res.status(400).json({ success: false, message: 'financial_records_category_id must be a number' });
      }
      query.financial_records_category_id = cid;
    } else if (category) {
      query.category = String(category).trim();
    }

    if (from || to) {
      query.date = {};
      if (from) {
        const d = parseDate(from);
        if (!d) return res.status(400).json({ success: false, message: 'from must be a valid date' });
        query.date.$gte = d;
      }
      if (to) {
        const d = parseDate(to);
        if (!d) return res.status(400).json({ success: false, message: 'to must be a valid date' });
        query.date.$lte = d;
      }
    }

    const records = await FinanceRecord.find(query).sort({ date: -1, record_id: -1 });
    return res.status(200).json({
      success: true,
      message: 'Records fetched successfully',
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch records', error: error.message });
  }
};

module.exports = {
  createFinanceRecordController,
  updateFinanceRecordController,
  deleteFinanceRecordController,
  getFinanceRecordByIdController,
  getAllFinanceRecordsController,
};

