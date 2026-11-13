import { z } from 'zod';

export const createSubmissionSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  description: z.string().trim().min(5, 'Submission description must be at least 5 characters'),
  approach: z.string().trim().min(10, 'Approach explanation must be at least 10 characters'),
  repositoryUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: 'Repository URL must start with http:// or https://',
    }),
  liveProjectUrl: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: 'Live project URL must start with http:// or https://',
    }),
  notes: z.string().trim().optional(),
});

