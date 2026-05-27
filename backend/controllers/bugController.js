const Bug = require('../models/Bug');
const logActivity = require('../utils/activityLogger');

exports.getBugs = async (req, res, next) => {
  try {
    const { status, priority, severity, assignedTo, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Bug.countDocuments(query);
    const bugs = await Bug.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bugs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      bugs
    });
  } catch (error) {
    next(error);
  }
};

exports.getBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }
    res.json({ success: true, bug });
  } catch (error) {
    next(error);
  }
};

exports.createBug = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const bug = await Bug.create(req.body);
    await bug.populate('assignedTo', 'name email avatar');
    await bug.populate('createdBy', 'name email avatar');

    await logActivity(req.user._id, 'created', 'Bug', bug._id, `Bug "${bug.title}" was created`);

    res.status(201).json({ success: true, bug });
  } catch (error) {
    next(error);
  }
};

exports.updateBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }

    const oldStatus = bug.status;
    const updatedBug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (oldStatus !== updatedBug.status) {
      await logActivity(
        req.user._id, 'status_changed', 'Bug', bug._id,
        `Bug "${bug.title}" status changed from ${oldStatus} to ${updatedBug.status}`
      );
    } else {
      await logActivity(req.user._id, 'updated', 'Bug', bug._id, `Bug "${bug.title}" was updated`);
    }

    res.json({ success: true, bug: updatedBug });
  } catch (error) {
    next(error);
  }
};

exports.deleteBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }

    await Bug.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'deleted', 'Bug', bug._id, `Bug "${bug.title}" was deleted`);

    res.json({ success: true, message: 'Bug deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignBug = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!bug) {
      return res.status(404).json({ success: false, message: 'Bug not found' });
    }

    await logActivity(
      req.user._id, 'assigned', 'Bug', bug._id,
      `Bug "${bug.title}" was assigned to ${bug.assignedTo?.name || 'Unassigned'}`
    );

    res.json({ success: true, bug });
  } catch (error) {
    next(error);
  }
};