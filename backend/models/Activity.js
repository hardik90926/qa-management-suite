const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'assigned', 'status_changed', 'executed', 'logged_in']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Bug', 'TestCase', 'TestSuite', 'User']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1 });

module.exports = mongoose.model('Activity', activitySchema);