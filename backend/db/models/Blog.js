const { mongoose } = require('../connection');
const { createId } = require('../../utils/ids');

const blogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => createId('blog') },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    featuredImage: { type: String, default: null },
    author: { type: String, default: 'UtilityTools Team' },
    readTime: { type: String, default: '5 min' },
    relatedToolSlug: { type: String, default: null },
    category: { type: String, default: null },
    categoryId: { type: String, default: null, ref: 'BlogCategory', index: true },
    status: { type: String, default: 'draft', enum: ['draft', 'published', 'scheduled'], index: true },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, default: null },
    metaDescription: { type: String, default: null },
    keywords: { type: mongoose.Schema.Types.Mixed, default: [] },
    canonicalUrl: { type: String, default: null },
    ogTitle: { type: String, default: null },
    ogDescription: { type: String, default: null },
    robotsIndex: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'Blog'
  }
);

blogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
