const { mongoose } = require('../connection');

const blogTagSchema = new mongoose.Schema(
  {
    blogId: { type: String, required: true, ref: 'Blog', index: true },
    tagId: { type: String, required: true, ref: 'Tag', index: true }
  },
  {
    collection: 'BlogTag'
  }
);

blogTagSchema.index({ blogId: 1, tagId: 1 }, { unique: true });

module.exports = mongoose.models.BlogTag || mongoose.model('BlogTag', blogTagSchema);
