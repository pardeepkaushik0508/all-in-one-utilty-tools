const { mongoose } = require('../connection');
const { createId } = require('../../utils/ids');

const activityLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => createId('log') },
    action: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  {
    collection: 'ActivityLog'
  }
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
