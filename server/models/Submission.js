import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge ID is required'],
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    description: {
      type: String,
      required: [true, 'Submission description is required'],
      trim: true,
    },
    approach: {
      type: String,
      required: [true, 'Explanation of approach is required'],
      trim: true,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveProjectUrl: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'needs_revision'],
      default: 'pending',
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // Sub-ratings for comprehensive evaluation
    correctnessRating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    codeQualityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    creativityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    reviewerFeedback: {
      type: String,
      trim: true,
      default: '',
    },
    strengths: {
      type: String,
      trim: true,
      default: '',
    },
    improvementAreas: {
      type: String,
      trim: true,
      default: '',
    },
    recommendedFocusTags: {
      type: [String],
      default: [],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ studentId: 1, challengeId: 1, attemptNumber: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;

