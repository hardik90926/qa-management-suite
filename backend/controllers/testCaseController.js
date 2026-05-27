const TestCase = require('../models/TestCase');
const logActivity = require('../utils/activityLogger');

exports.getTestCases = async (req, res, next) => {
  try {
    const { suite, status, assignedTo, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (suite) query.suite = suite;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await TestCase.countDocuments(query);
    const testCases = await TestCase.find(query)
      .populate('suite', 'name project')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('executedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: testCases.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      testCases
    });
  } catch (error) {
    next(error);
  }
};

exports.getTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findById(req.params.id)
      .populate('suite', 'name project')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('executedBy', 'name email');

    if (!testCase) {
      return res.status(404).json({ success: false, message: 'Test case not found' });
    }
    res.json({ success: true, testCase });
  } catch (error) {
    next(error);
  }
};

exports.createTestCase = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const testCase = await TestCase.create(req.body);
    await testCase.populate('suite', 'name project');
    await testCase.populate('createdBy', 'name email avatar');

    await logActivity(req.user._id, 'created', 'TestCase', testCase._id, `Test case "${testCase.title}" was created`);

    res.status(201).json({ success: true, testCase });
  } catch (error) {
    next(error);
  }
};

exports.updateTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('suite', 'name project')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!testCase) {
      return res.status(404).json({ success: false, message: 'Test case not found' });
    }

    await logActivity(req.user._id, 'updated', 'TestCase', testCase._id, `Test case "${testCase.title}" was updated`);

    res.json({ success: true, testCase });
  } catch (error) {
    next(error);
  }
};

exports.executeTestCase = async (req, res, next) => {
  try {
    const { status, executionComment } = req.body;

    const testCase = await TestCase.findByIdAndUpdate(
      req.params.id,
      {
        status,
        executionComment,
        executedBy: req.user._id,
        executedAt: new Date()
      },
      { new: true }
    )
      .populate('suite', 'name project')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('executedBy', 'name email');

    if (!testCase) {
      return res.status(404).json({ success: false, message: 'Test case not found' });
    }

    await logActivity(
      req.user._id, 'executed', 'TestCase', testCase._id,
      `Test case "${testCase.title}" executed with status: ${status}`
    );

    res.json({ success: true, testCase });
  } catch (error) {
    next(error);
  }
};

exports.deleteTestCase = async (req, res, next) => {
  try {
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ success: false, message: 'Test case not found' });
    }

    await TestCase.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'deleted', 'TestCase', testCase._id, `Test case "${testCase.title}" was deleted`);

    res.json({ success: true, message: 'Test case deleted successfully' });
  } catch (error) {
    next(error);
  }
};