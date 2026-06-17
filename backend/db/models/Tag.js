const { mongoose } = require('../connection');
const { createId } = require('../../utils/ids');

const tagSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => createId('tag') },
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true }
  },
  {
    collection: 'Tag'
  }
);

module.exports = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
