const { mongoose } = require('../connection');
const { createId } = require('../../utils/ids');

const blogCategorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => createId('cat') },
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
    isBuiltin: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    collection: 'BlogCategory'
  }
);

module.exports = mongoose.models.BlogCategory || mongoose.model('BlogCategory', blogCategorySchema);
