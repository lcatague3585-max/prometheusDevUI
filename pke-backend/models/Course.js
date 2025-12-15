/**
 * Course Model
 * Main course data structure with full PKE workflow support
 */

const mongoose = require('mongoose');

// Learning Objective sub-schema
const learningObjectiveSchema = new mongoose.Schema({
  code: String,           // e.g., "LO1", "LO2"
  text: String,           // The actual objective
  bloomLevel: {
    type: String,
    enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
  },
  evidenceGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    default: 'D',
  },
  sourceRef: String,      // Citation or source reference
}, { _id: false });

// Lesson sub-schema
const lessonSchema = new mongoose.Schema({
  title: String,
  duration: Number,       // in minutes
  content: String,
  performanceCriteria: [String],
  evidenceGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    default: 'D',
  },
}, { _id: false });

// Subtopic sub-schema
const subtopicSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema],
  notes: String,
}, { _id: false });

// Topic sub-schema
const topicSchema = new mongoose.Schema({
  title: String,
  subtopics: [subtopicSchema],
  order: Number,
}, { _id: false });

// Main Course Schema
const courseSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  
  // Metadata
  metadata: {
    code: String,
    duration: {
      value: { type: Number, default: 1 },
      unit: { type: String, enum: ['hours', 'days', 'weeks'], default: 'days' },
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    theme: String,
    targetAudience: String,
    assistanceTier: {
      type: String,
      enum: ['full', 'guided', 'minimal'],
      default: 'full',
    },
  },

  // PKE Generated Content
  learningObjectives: [learningObjectiveSchema],
  
  structure: {
    topics: [topicSchema],
  },

  // Assessments (from Invocation 4)
  assessments: [{
    question: String,
    type: { type: String, enum: ['MCQ', 'TrueFalse', 'ShortAnswer'] },
    options: [String],
    correctAnswer: String,
    linkedLO: String,
  }],

  // Workflow State
  currentStage: {
    type: String,
    enum: ['define', 'design', 'build', 'format', 'generate'],
    default: 'define',
  },
  
  completedInvocations: [{
    invocation: Number,
    completedAt: Date,
    evidenceGrade: String,
  }],

  // Gates
  gates: {
    gateA: { type: Boolean, default: false },  // Authenticated
    gateB: { type: Boolean, default: false },  // Title saved
  },

  // Ownership
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'review', 'published', 'archived'],
    default: 'draft',
  },

  // Revision History
  revisionHistory: [{
    version: Number,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    changeType: String,
    summary: String,
  }],

}, {
  timestamps: true,
});

// Index for faster queries
courseSchema.index({ owner: 1, status: 1 });
courseSchema.index({ title: 'text', 'metadata.theme': 'text' });

module.exports = mongoose.model('Course', courseSchema);
