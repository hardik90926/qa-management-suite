const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, createUser, updateUser, updateUserRole, deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize('Admin'), createUser);

router.route('/:id')
  .get(getUser)
  .put(authorize('Admin'), updateUser)
  .delete(authorize('Admin'), deleteUser);

router.put('/:id/role', authorize('Admin'), updateUserRole);

module.exports = router;