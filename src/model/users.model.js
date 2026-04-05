const mongoose = require('mongoose');
const { PERMISSIONS } = require('./roles.model');

const usersSchema = new mongoose.Schema(
  {
    user_id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true, index: true },
    password: { type: String, required: true },

    role_id: { type: Number, required: true, ref: 'Roles' }, // maps to Roles.role_id
    permissions: { type: [String], enum: PERMISSIONS, default: undefined }, // if set (non-empty), overrides role permissions
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

module.exports = mongoose.model('Users', usersSchema);

