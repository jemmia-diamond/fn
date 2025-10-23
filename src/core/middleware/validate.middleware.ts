import { ValidationTargets } from "hono";
import { validator } from "hono/validator";
import z from "zod";

/**
 * Validator payload middleware using typia
 * @param contentType Content type to validate
 * @returns 
 */
export function validate(contentType: keyof ValidationTargets, schema: z.Schema) {
    return validator(contentType, (value, c) => {
        const result = schema.safeParse(value);
        if (!result.success) {
            return c.json({ error: result.error.flatten() }, 400);
        }

        return result.data;
    })
}