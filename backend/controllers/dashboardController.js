const Bug = require('../models/Bug');
const TestCase = require('../models/TestCase');
const Activity = require('../models/Activity');
const User = require('../models/User');

exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalBugs,
      openBugs,
      inProgressBugs,
      fixedBugs,
      closedBugs,
      totalTestCases,
      passedTests,
      failedTests,
      blockedTests,
      notExecutedTests,
      totalUsers,
      recentActivities,
      bugsBySeverity,
      bugsByPriority,
      recentBugs
    ] = await Promise.all([
      Bug.countDocuments(),
      Bug.countDocuments({ status: 'Open' }),
      Bug.countDocuments({ status: 'In Progress' }),
      Bug.countDocuments({ status: 'Fixed' }),
      Bug.countDocuments({ status: 'Closed' }),
      TestCase.countDocuments(),
      TestCase.countDocuments({ status: 'Pass' }),
      TestCase.countDocuments({ status: 'Fail' }),
      TestCase.countDocuments({ status: 'Blocked' }),
      TestCase.countDocuments({ status: 'Not Executed' }),
      User.countDocuments({ isActive: true }),
      Activity.find()
        .populate('user', 'name avatar role')
        .sort({ createdAt: -1 })
        .limit(10),
      Bug.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Bug.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Bug.find()
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const severityData = ['Minor', 'Major', 'Blocker'].map(s => ({
      name: s,
      value: bugsBySeverity.find(b => b._id === s)?.count || 0
    }));

    const priorityData = ['Low', 'Medium', 'High', 'Critical'].map(p => ({
      name: p,
      value: bugsByPriority.find(b => b._id === p)?.count || 0
    }));

    res.json({
      success: true,
      metrics: {
        bugs: {
          total: totalBugs,
          open: openBugs,
          inProgress: inProgressBugs,
          fixed: fixedBugs,
          closed: closedBugs
        },
        testCases: {
          total: totalTestCases,
          pass: passedTests,
          fail: failedTests,
          blocked: blockedTests,
          notExecuted: notExecutedTests,
          passRate: totalTestCases > 0 ? Math.round((passedTests / totalTestCases) * 100) : 0
        },
        users: { total: totalUsers },
        charts: {
          bugsBySeverity: severityData,
          bugsByPriority: priorityData
        },
        recentActivities,
        recentBugs
      }
    });
  } catch (error) {
    next(error);
  }
};