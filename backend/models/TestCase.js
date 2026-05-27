const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test case title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  steps: [{
    type: String,
    trim: true
  }],
  expectedResult: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Not Executed', 'Pass', 'Fail', 'Blocked'],
    default: 'Not Executed'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  suite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSuite',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  executionComment: {
    type: String,
    default: ''
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  executedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

testCaseSchema.index({ suite: 1, status: 1 });

module.exports = mongoose.model('TestCase', testCaseSchema);