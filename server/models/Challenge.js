import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true,
    },
    instructions: {
      type: String,
      required: [true, 'Detailed instructions are required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: [true, 'Difficulty is required'],
      default: 'Beginner',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Web Development',
    },
    skills: {
      type: [String],
      default: [],
    },
    estimatedMinutes: {
      type: Number,
      required: [true, 'Estimated duration in minutes is required'],
      min: [5, 'Estimated duration must be at least 5 minutes'],
      default: 60,
    },
    deliverables: {
      type: [String],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for catalogue queries
challengeSchema.index({ difficulty: 1, category: 1, isPublished: 1 });
challengeSchema.index({ title: 'text', description: 'text', skills: 'text' });

export const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;

