import * as z from 'zod';

export const ExamplePayload = z.object({
  message: z.string().min(5).max(10),
});
