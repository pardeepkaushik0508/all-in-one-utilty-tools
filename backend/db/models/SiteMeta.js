const { mongoose } = require('../connection');

const siteMetaSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'SiteMeta'
  }
);

module.exports = mongoose.models.SiteMeta || mongoose.model('SiteMeta', siteMetaSchema);
