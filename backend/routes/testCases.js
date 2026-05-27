const express = require('express');
const router = express.Router();
const {
  getTestCases, getTestCase, createTestCase, updateTestCase, executeTestCase, deleteTestCase
} = require('../controllers/testCaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTestCases)
  .post(createTestCase);

router.route('/:id')
  .get(getTestCase)
  .put(updateTestCase)
  .delete(authorize('Admin', 'QA Lead'), deleteTestCase);

router.put('/:id/execute', executeTestCase);

module.exports = router;