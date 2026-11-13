import { z } from 'zod';

export const createChallengeSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  problemStatement: z.string().trim().min(10, 'Problem statement is required'),
  instructions: z.string().trim().min(10, 'Instructions are required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'], {
    errorMap: () => ({ message: 'Difficulty must be Beginner, Intermediate, Advanced, or Expert' }),
  }),
  category: z.string().trim().min(2, 'Category is required'),
  skills: z.array(z.string().trim()).default([]),
  estimatedMinutes: z.coerce.number().min(5, 'Estimated minutes must be at least 5'),
  deliverables: z.array(z.string().trim()).default([]),
  hints: z.array(z.string().trim()).default([]),
  prerequisites: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
});

export const updateChallengeSchema = createChallengeSchema.partial();

