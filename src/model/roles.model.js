const mongoose = require('mongoose');

const PERMISSIONS = ['Create', 'Edit', 'View', 'Delete', 'Update', 'Filter', 'All', 'Import', 'Export'];

const rolesSchema = new mongoose.Schema(
  {
    role_id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    permissions: {
      type: [String],
      enum: PERMISSIONS,
      default: ['View'],
    },
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

module.exports = mongoose.model('Roles', rolesSchema);
module.exports.PERMISSIONS = PERMISSIONS;

