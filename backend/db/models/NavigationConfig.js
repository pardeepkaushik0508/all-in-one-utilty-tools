const { mongoose } = require('../connection');

const navigationConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'default' },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'NavigationConfig'
  }
);

module.exports = mongoose.models.NavigationConfig || mongoose.model('NavigationConfig', navigationConfigSchema);
