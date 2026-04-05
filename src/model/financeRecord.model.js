const mongoose = require('mongoose');

const TYPES = ['income', 'expense'];

const financeRecordSchema = new mongoose.Schema(
  {
    record_id: { type: Number, unique: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: TYPES, required: true },
    financial_records_category_id: {
      type: Number,
      required: true,
      index: true,
      ref: 'Financial_Records_Category',
    }, // maps to Financial_Records_Category.financial_records_category_id
    category: { type: String, required: true, trim: true }, // cached category name for easy reads
    date: { type: Date, required: true },
    notes: { type: String, default: '', trim: true },

    status: { type: Boolean, default: true },
    createdBy: { type: Number, ref: 'Users', default: null },
    updatedBy: { type: Number, ref: 'Users', default: null },
    DeletedBy: { type: Number, ref: 'Users', default: null },
    DeletedAt: { type: Date, default: null },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

module.exports = mongoose.model('FinanceRecord', financeRecordSchema);
module.exports.TYPES = TYPES;

