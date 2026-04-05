const mongoose = require('mongoose');

const financialRecordsCategorySchema = new mongoose.Schema(
  {
    financial_records_category_id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true, unique: true, index: true },
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

module.exports = mongoose.model('Financial_Records_Category', financialRecordsCategorySchema);

