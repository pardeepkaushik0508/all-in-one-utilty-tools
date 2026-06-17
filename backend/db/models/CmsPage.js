const { mongoose } = require('../connection');

const cmsPageSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    sections: { type: mongoose.Schema.Types.Mixed, default: [] },
    seo: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, default: 'published', enum: ['draft', 'published', 'scheduled'] },
    scheduledAt: { type: Date, default: null },
    revisions: { type: mongoose.Schema.Types.Mixed, default: [] }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'CmsPage'
  }
);

module.exports = mongoose.models.CmsPage || mongoose.model('CmsPage', cmsPageSchema);
