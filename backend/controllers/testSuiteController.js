const TestSuite = require('../models/TestSuite');
const TestCase = require('../models/TestCase');
const logActivity = require('../utils/activityLogger');

exports.getTestSuites = async (req, res, next) => {
  try {
    const suites = await TestSuite.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const suitesWithCounts = await Promise.all(
      suites.map(async (suite) => {
        const testCases = await TestCase.find({ suite: suite._id });
        const counts = {
          total: testCases.length,
          pass: testCases.filter(tc => tc.status === 'Pass').length,
          fail: testCases.filter(tc => tc.status === 'Fail').length,
          blocked: testCases.filter(tc => tc.status === 'Blocked').length,
          notExecuted: testCases.filter(tc => tc.status === 'Not Executed').length
        };
        return { ...suite.toObject(), counts };
      })
    );

    res.json({ success: true, testSuites: suitesWithCounts });
  } catch (error) {
    next(error);
  }
};

exports.getTestSuite = async (req, res, next) => {
  try {
    const suite = await TestSuite.findById(req.params.id).populate('createdBy', 'name email');
    if (!suite) {
      return res.status(404).json({ success: false, message: 'Test suite not found' });
    }
    res.json({ success: true, testSuite: suite });
  } catch (error) {
    next(error);
  }
};

exports.createTestSuite = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const suite = await TestSuite.create(req.body);
    await suite.populate('createdBy', 'name email');

    await logActivity(req.user._id, 'created', 'TestSuite', suite._id, `Test suite "${suite.name}" was created`);

    res.status(201).json({ success: true, testSuite: suite });
  } catch (error) {
    next(error);
  }
};

exports.updateTestSuite = async (req, res, next) => {
  try {
    const suite = await TestSuite.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');

    if (!suite) {
      return res.status(404).json({ success: false, message: 'Test suite not found' });
    }

    res.json({ success: true, testSuite: suite });
  } catch (error) {
    next(error);
  }
};

exports.deleteTestSuite = async (req, res, next) => {
  try {
    const suite = await TestSuite.findById(req.params.id);
    if (!suite) {
      return res.status(404).json({ success: false, message: 'Test suite not found' });
    }

    await TestCase.deleteMany({ suite: req.params.id });
    await TestSuite.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Test suite deleted successfully' });
  } catch (error) {
    next(error);
  }
};