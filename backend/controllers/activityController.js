const Activity = require('../models/Activity');

exports.getActivities = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const total = await Activity.countDocuments();
    const activities = await Activity.find()
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      activities,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    next(error);
  }
};