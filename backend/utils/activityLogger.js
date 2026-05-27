const Activity = require('../models/Activity');

const logActivity = async (userId, action, entityType, entityId, description, metadata = {}) => {
  try {
    await Activity.create({
      user: userId,
      action,
      entityType,
      entityId,
      description,
      metadata
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = logActivity;