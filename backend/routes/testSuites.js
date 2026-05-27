const express = require('express');
const router = express.Router();
const {
  getTestSuites, getTestSuite, createTestSuite, updateTestSuite, deleteTestSuite
} = require('../controllers/testSuiteController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTestSuites)
  .post(createTestSuite);

router.route('/:id')
  .get(getTestSuite)
  .put(updateTestSuite)
  .delete(authorize('Admin', 'QA Lead'), deleteTestSuite);

module.exports = router;