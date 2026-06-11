import { z } from "zod";

export type ZodValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: any };

export function validateZodOrError<T extends z.ZodTypeAny>(
  c: any,
  schema: T,
  data: unknown
): ZodValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      ok: false as const,
      response: c.json(
        {
          error: "Invalid request body",
          details: result.error.issues
        },
        400
      )
    };
  }
  return { ok: true as const, data: result.data };
}
