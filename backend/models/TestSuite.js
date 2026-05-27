const mongoose = require('mongoose');

const testSuiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test suite name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  project: {
    type: String,
    default: 'General'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TestSuite', testSuiteSchema);