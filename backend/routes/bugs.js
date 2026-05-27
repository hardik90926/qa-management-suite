const express = require('express');
const router = express.Router();
const {
  getBugs, getBug, createBug, updateBug, deleteBug, assignBug
} = require('../controllers/bugController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBugs)
  .post(createBug);

router.route('/:id')
  .get(getBug)
  .put(updateBug)
  .delete(authorize('Admin', 'QA Lead'), deleteBug);

router.put('/:id/assign', assignBug);

module.exports = router;