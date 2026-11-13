import { z } from 'zod';

export const reviewSubmissionSchema = z.object({
  decision: z.enum(['approved', 'needs_revision'], {
    errorMap: () => ({ message: 'Decision must be approved or needs_revision' }),
  }),
  score: z.coerce.number().min(0).max(100, 'Score must be between 0 and 100'),
  correctnessRating: z.coerce.number().min(0).max(5).optional(),
  codeQualityRating: z.coerce.number().min(0).max(5).optional(),
  creativityRating: z.coerce.number().min(0).max(5).optional(),
  reviewerFeedback: z.string().trim().min(5, 'Reviewer feedback is required (min 5 chars)'),
  strengths: z.string().trim().default(''),
  improvementAreas: z.string().trim().default(''),
  recommendedFocusTags: z.array(z.string().trim()).default([]),
});

