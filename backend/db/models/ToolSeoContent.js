const { mongoose } = require('../connection');

const toolSeoContentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true, unique: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'ToolSeoContent'
  }
);

module.exports = mongoose.models.ToolSeoContent || mongoose.model('ToolSeoContent', toolSeoContentSchema);
