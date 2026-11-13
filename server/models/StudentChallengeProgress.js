import mongoose from 'mongoose';

const studentChallengeProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge ID is required'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add unique compound index on studentId and challengeId as required
studentChallengeProgressSchema.index({ studentId: 1, challengeId: 1 }, { unique: true });

export const StudentChallengeProgress = mongoose.model(
  'StudentChallengeProgress',
  studentChallengeProgressSchema
);
export default StudentChallengeProgress;

