const { mongoose } = require('../connection');
const { createId } = require('../../utils/ids');

const mediaAssetSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => createId('media') },
    filename: { type: String, required: true },
    storedName: { type: String, default: null },
    mimeType: { type: String, default: null },
    size: { type: Number, default: null },
    url: { type: String, default: null },
    storage: { type: String, default: null },
    localPath: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  {
    collection: 'MediaAsset'
  }
);

module.exports = mongoose.models.MediaAsset || mongoose.model('MediaAsset', mediaAssetSchema);
