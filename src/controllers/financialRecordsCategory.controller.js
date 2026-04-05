const Counter = require('../model/counter.model');
const FinancialRecordsCategory = require('../model/financialRecordsCategory.model');

function getAuthUserId(req) {
  return req.user && req.user.user_id ? req.user.user_id : null;
}

const createFinancialRecordsCategoryController = async (req, res) => {
  try {
    const { name, status = true } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const existing = await FinancialRecordsCategory.findOne({
      name: name.trim(),
      DeletedAt: null,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const createdBy = getAuthUserId(req);
    const maxCategory = await FinancialRecordsCategory.findOne({ DeletedAt: null }).sort({ financial_records_category_id: -1 }).select('financial_records_category_id').lean();
    const categoryId = await Counter.getNextSequence('Financial_Records_Category', maxCategory?.financial_records_category_id || 0);
    const category = new FinancialRecordsCategory({
      financial_records_category_id: categoryId,
      name: name.trim(),
      status: Boolean(status),
      createdBy,
    });

    const saved = await category.save();
    return res.status(201).json({ success: true, message: 'Category created successfully', data: saved });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

const updateFinancialRecordsCategoryController = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const { name, status } = req.body || {};

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ success: false, message: 'name must be a non-empty string' });
    }

    if (name !== undefined) {
      const dupe = await FinancialRecordsCategory.findOne({
        name: name.trim(),
        DeletedAt: null,
        financial_records_category_id: { $ne: categoryId },
      });
      if (dupe) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
    }

    const updatedBy = getAuthUserId(req);
    const updateData = {
      ...(name !== undefined && { name: name.trim() }),
      ...(status !== undefined && { status: Boolean(status) }),
      ...(updatedBy !== null && { updatedBy }),
    };

    const updated = await FinancialRecordsCategory.findOneAndUpdate(
      { financial_records_category_id: categoryId, DeletedAt: null },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.status(200).json({ success: true, message: 'Category updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

const deleteFinancialRecordsCategoryController = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const DeletedBy = getAuthUserId(req);
    const deleted = await FinancialRecordsCategory.findOneAndUpdate(
      { financial_records_category_id: categoryId, DeletedAt: null },
      { status: false, DeletedBy, DeletedAt: new Date() },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.status(200).json({ success: true, message: 'Category deleted successfully', data: deleted });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

const getFinancialRecordsCategoryByIdController = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const category = await FinancialRecordsCategory.findOne({
      financial_records_category_id: categoryId,
      DeletedAt: null,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    return res.status(200).json({ success: true, message: 'Category fetched successfully', data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message });
  }
};

const getAllFinancialRecordsCategoriesController = async (req, res) => {
  try {
    const categories = await FinancialRecordsCategory.find({ DeletedAt: null }).sort({
      financial_records_category_id: 1,
    });
    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

module.exports = {
  createFinancialRecordsCategoryController,
  updateFinancialRecordsCategoryController,
  deleteFinancialRecordsCategoryController,
  getFinancialRecordsCategoryByIdController,
  getAllFinancialRecordsCategoriesController,
};

