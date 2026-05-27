require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Bug = require('../models/Bug');
const TestSuite = require('../models/TestSuite');
const TestCase = require('../models/TestCase');
const Activity = require('../models/Activity');

// Called by database.js after in-memory server starts (connection already open)
const runSeed = async () => {
  try {
    await User.deleteMany({});
    await Bug.deleteMany({});
    await TestSuite.deleteMany({});
    await TestCase.deleteMany({});
    await Activity.deleteMany({});

    const users = await User.create([
      { name: 'Admin User',    email: 'admin@qamanager.com', password: 'admin123',     role: 'Admin',   avatar: 'AU' },
      { name: 'Sarah Johnson', email: 'sarah@qamanager.com', password: 'password123',  role: 'QA Lead', avatar: 'SJ' },
      { name: 'Mike Chen',     email: 'mike@qamanager.com',  password: 'password123',  role: 'Tester',  avatar: 'MC' },
      { name: 'Emily Davis',   email: 'emily@qamanager.com', password: 'password123',  role: 'Tester',  avatar: 'ED' },
      { name: 'James Wilson',  email: 'james@qamanager.com', password: 'password123',  role: 'QA Lead', avatar: 'JW' }
    ]);
    const [admin, sarah, mike, emily, james] = users;

    const bugs = await Bug.create([
      { title: 'Login page crashes on mobile devices',          description: 'The login page throws a JavaScript error and crashes when accessed from iOS Safari.', status: 'Open',        priority: 'Critical', severity: 'Blocker', assignedTo: mike._id,  createdBy: sarah._id, project: 'Web Application',  tags: ['mobile','safari','login'],        stepsToReproduce: '1. Open Safari on iOS\n2. Navigate to login page\n3. Page crashes', expectedResult: 'Login page loads normally', actualResult: 'Page crashes with JS error', environment: 'iOS 16, Safari 16' },
      { title: 'Dashboard charts not rendering correctly',       description: 'The pie chart on the dashboard shows incorrect data percentages.',                     status: 'In Progress', priority: 'High',     severity: 'Major',   assignedTo: emily._id, createdBy: admin._id, project: 'Web Application',  tags: ['dashboard','charts','data'],      stepsToReproduce: '1. Log in\n2. Go to Dashboard\n3. Check bug severity chart',         expectedResult: 'Charts show correct percentages', actualResult: 'Percentages are off by 15%', environment: 'Chrome 120, Windows 11' },
      { title: 'Password reset email not being sent',            description: 'Users report not receiving password reset emails after requesting.',                    status: 'Open',        priority: 'High',     severity: 'Major',   assignedTo: james._id, createdBy: sarah._id, project: 'Authentication',   tags: ['email','password-reset','auth'],  environment: 'Production' },
      { title: 'Search functionality returns duplicate results', description: 'When searching for bugs, duplicate entries appear in the results.',                    status: 'Fixed',       priority: 'Medium',   severity: 'Minor',   assignedTo: mike._id,  createdBy: emily._id, project: 'Web Application',  tags: ['search','duplicates'] },
      { title: 'Export to CSV feature broken',                   description: 'The CSV export button does not generate a file.',                                       status: 'Open',        priority: 'Medium',   severity: 'Major',   assignedTo: null,      createdBy: admin._id, project: 'Reports',          tags: ['export','csv'] },
      { title: 'User profile image upload fails for large files',description: 'Images larger than 2MB fail to upload without proper error message.',                  status: 'Closed',      priority: 'Low',      severity: 'Minor',   assignedTo: emily._id, createdBy: mike._id,  project: 'User Management',  tags: ['upload','profile','image'] },
      { title: 'API timeout on reports generation',              description: 'Generating large reports causes API timeout after 30 seconds.',                        status: 'In Progress', priority: 'High',     severity: 'Blocker', assignedTo: james._id, createdBy: sarah._id, project: 'Reports',          tags: ['api','timeout','performance'], environment: 'Production' },
      { title: 'Notification bell shows wrong count',            description: 'The notification count badge shows +3 even after reading all notifications.',          status: 'Open',        priority: 'Low',      severity: 'Minor',   assignedTo: mike._id,  createdBy: emily._id, project: 'Web Application',  tags: ['notifications','ui'] },
      { title: 'Filter by date range not working',               description: 'Filtering test cases by date range returns no results.',                               status: 'Open',        priority: 'Medium',   severity: 'Major',   assignedTo: sarah._id, createdBy: admin._id, project: 'Test Management',  tags: ['filters','date','test-cases'] },
      { title: 'Bulk delete confirmation modal not appearing',   description: 'When selecting multiple bugs and clicking delete, no confirmation is shown.',          status: 'Fixed',       priority: 'Medium',   severity: 'Major',   assignedTo: emily._id, createdBy: james._id, project: 'Web Application',  tags: ['delete','modal','bulk'] }
    ]);

    const suites = await TestSuite.create([
      { name: 'Authentication Test Suite', description: 'All authentication related test cases.',              project: 'Authentication',  createdBy: sarah._id },
      { name: 'Dashboard Functionality',   description: 'Test cases for dashboard features.',                  project: 'Web Application', createdBy: admin._id },
      { name: 'Bug Management Tests',      description: 'End-to-end testing of bug workflow.',                 project: 'Bug Tracker',     createdBy: james._id },
      { name: 'API Integration Tests',     description: 'Backend API endpoint testing for all modules.',       project: 'Backend',         createdBy: sarah._id }
    ]);

    const testCases = await TestCase.create([
      { title: 'Valid login with correct credentials', description: 'Verify user can login', steps: ['Navigate to login page','Enter valid email','Enter valid password','Click Login'], expectedResult: 'User redirected to dashboard',       status: 'Pass',         priority: 'High',   suite: suites[0]._id, assignedTo: mike._id,  createdBy: sarah._id, executionComment: 'Login works as expected',                          executedBy: mike._id,  executedAt: new Date() },
      { title: 'Login fails with wrong password',      description: 'Verify error for wrong password',         steps: ['Navigate to login','Enter valid email','Enter wrong password','Click Login'],            expectedResult: 'Error message shown',               status: 'Pass',         priority: 'High',   suite: suites[0]._id, assignedTo: mike._id,  createdBy: sarah._id, executionComment: 'Error message shown correctly',                   executedBy: mike._id,  executedAt: new Date() },
      { title: 'Logout clears session',                description: 'Verify user is logged out',               steps: ['Login','Click user menu','Click Logout','Try accessing protected page'],                 expectedResult: 'User redirected to login page',     status: 'Pass',         priority: 'Medium', suite: suites[0]._id, assignedTo: emily._id, createdBy: sarah._id,                                                                                 executedBy: emily._id, executedAt: new Date() },
      { title: 'Password reset email delivery',        description: 'Verify password reset email is sent',     steps: ['Go to login','Click Forgot Password','Enter email','Check inbox'],                       expectedResult: 'Email received within 5 minutes',   status: 'Fail',         priority: 'High',   suite: suites[0]._id, assignedTo: james._id, createdBy: sarah._id, executionComment: 'Email not received - related to bug #3',          executedBy: james._id, executedAt: new Date() },
      { title: 'Dashboard loads KPI cards',            description: 'Verify all KPI cards display correctly',  steps: ['Login','Navigate to Dashboard','Check all KPI cards'],                                   expectedResult: 'All 4 KPI cards show data',         status: 'Pass',         priority: 'High',   suite: suites[1]._id, assignedTo: emily._id, createdBy: admin._id,                                                                                 executedBy: emily._id, executedAt: new Date() },
      { title: 'Severity chart renders correctly',     description: 'Verify severity pie chart is correct',    steps: ['Login','Go to Dashboard','Check severity chart'],                                        expectedResult: 'Pie chart shows correct distribution',status: 'Fail',        priority: 'Medium', suite: suites[1]._id, assignedTo: emily._id, createdBy: admin._id, executionComment: 'Chart percentages incorrect - related to bug #2', executedBy: emily._id, executedAt: new Date() },
      { title: 'Recent activities feed',               description: 'Verify activity feed updates',             steps: ['Login','Go to Dashboard','Create a bug','Check activity feed'],                         expectedResult: 'New activity appears in feed',       status: 'Not Executed', priority: 'Low',    suite: suites[1]._id, assignedTo: mike._id,  createdBy: admin._id },
      { title: 'Create bug with all required fields',  description: 'Verify bug creation with mandatory fields',steps: ['Go to Bug Management','Click Create Bug','Fill required fields','Submit'],               expectedResult: 'Bug created and appears in list',   status: 'Pass',         priority: 'High',   suite: suites[2]._id, assignedTo: mike._id,  createdBy: james._id,                                                                                 executedBy: mike._id,  executedAt: new Date() },
      { title: 'Edit bug status workflow',             description: 'Verify bug status workflow',               steps: ['Open bug','Change to In Progress','Change to Fixed','Change to Closed'],                expectedResult: 'Status changes saved successfully', status: 'Pass',         priority: 'High',   suite: suites[2]._id, assignedTo: sarah._id, createdBy: james._id,                                                                                 executedBy: sarah._id, executedAt: new Date() },
      { title: 'Delete bug requires confirmation',     description: 'Verify confirmation dialog appears',       steps: ['Go to bug list','Click delete on a bug','Check for confirmation dialog'],                expectedResult: 'Confirmation modal appears',         status: 'Blocked',      priority: 'Medium', suite: suites[2]._id, assignedTo: emily._id, createdBy: james._id, executionComment: 'Blocked by bug #10',                               executedBy: emily._id, executedAt: new Date() },
      { title: 'Bug search and filtering',             description: 'Verify search and filter functionality',   steps: ['Go to bug list','Use search bar','Apply status filter','Apply priority filter'],         expectedResult: 'Results match search criteria',     status: 'Pass',         priority: 'Medium', suite: suites[2]._id, assignedTo: mike._id,  createdBy: james._id,                                                                                 executedBy: mike._id,  executedAt: new Date() },
      { title: 'Assign bug to team member',            description: 'Verify bug assignment functionality',      steps: ['Open a bug','Click Assign','Select a team member','Confirm'],                           expectedResult: 'Bug assigned and user notified',    status: 'Not Executed', priority: 'Medium', suite: suites[2]._id, assignedTo: null,      createdBy: james._id }
    ]);

    await Activity.create([
      { user: admin._id, action: 'logged_in',     entityType: 'User',      entityId: admin._id,     description: 'Admin User logged in' },
      { user: sarah._id, action: 'created',       entityType: 'Bug',       entityId: bugs[0]._id,   description: 'Bug "Login page crashes on mobile devices" was created' },
      { user: mike._id,  action: 'status_changed',entityType: 'Bug',       entityId: bugs[3]._id,   description: 'Bug "Search functionality returns duplicate results" status changed to Fixed' },
      { user: emily._id, action: 'executed',      entityType: 'TestCase',  entityId: testCases[0]._id, description: 'Test case "Valid login with correct credentials" executed with status: Pass' },
      { user: james._id, action: 'created',       entityType: 'TestSuite', entityId: suites[2]._id, description: 'Test suite "Bug Management Tests" was created' },
      { user: sarah._id, action: 'assigned',      entityType: 'Bug',       entityId: bugs[6]._id,   description: 'Bug "API timeout on reports generation" was assigned to James Wilson' },
      { user: admin._id, action: 'created',       entityType: 'Bug',       entityId: bugs[4]._id,   description: 'Bug "Export to CSV feature broken" was created' },
      { user: mike._id,  action: 'executed',      entityType: 'TestCase',  entityId: testCases[7]._id, description: 'Test case "Create bug with all required fields" executed with status: Pass' }
    ]);

    console.log('✅ Demo data seeded: 5 users, 10 bugs, 4 suites, 12 test cases');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

// Allow running directly: node seed/seedData.js
if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qa_management_suite');
    await runSeed();
    process.exit(0);
  })().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed };