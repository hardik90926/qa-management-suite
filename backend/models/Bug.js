const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Fixed', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  severity: {
    type: String,
    enum: ['Minor', 'Major', 'Blocker'],
    default: 'Minor'
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
  project: {
    type: String,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  screenshot: {
    type: String,
    default: ''
  },
  stepsToReproduce: {
    type: String,
    default: ''
  },
  expectedResult: {
    type: String,
    default: ''
  },
  actualResult: {
    type: String,
    default: ''
  },
  environment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

bugSchema.index({ status: 1, priority: 1, severity: 1 });
bugSchema.index({ createdBy: 1 });
bugSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Bug', bugSchema);