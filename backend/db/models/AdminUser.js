const { mongoose } = require('../connection');
const { createId } = require('../../utils/ids');

const adminUserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => createId('admin') },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, default: null },
    name: { type: String, default: null },
    role: { type: String, default: 'admin' }
  },
  {
    timestamps: true,
    collection: 'AdminUser'
  }
);

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
