import z from "zod";
import { TokenSchema } from "./token.schema";

export const ResetPasswordSchema = TokenSchema.extend({
    new_password: z.string().min(8).max(32)
    .regex(/[a-z]/,"must include a lowercase letter")
    .regex(/[A-Z]/,"must include a uppercase letter")
    .regex(/[0-9]/,"must contain at least one number")
    .regex(/\W|_/,"must include a special character"),
})

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

