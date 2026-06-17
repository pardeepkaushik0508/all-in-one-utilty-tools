const { mongoose } = require('../connection');

const toolSettingSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true, unique: true, trim: true },
    toolName: { type: String, default: null },
    enabled: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    hiddenFromSearch: { type: Boolean, default: false },
    hiddenFromHomepage: { type: Boolean, default: false },
    hiddenFromNavigation: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    scheduledEnableAt: { type: Date, default: null },
    scheduledDisableAt: { type: Date, default: null },
    maintenanceMessage: { type: String, default: null }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'ToolSetting'
  }
);

module.exports = mongoose.models.ToolSetting || mongoose.model('ToolSetting', toolSettingSchema);
