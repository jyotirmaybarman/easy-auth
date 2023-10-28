import z from "zod";

export const CreateUserSchema = z.object({
    first_name: z.string().min(1).max(50).regex(/^[a-zA-Z]+$/).trim(),
    middle_name: z.string().min(1).max(50).regex(/^[a-zA-Z]+$/).trim().optional(),
    last_name: z.string().min(1).max(50).regex(/^[a-zA-Z]+$/).trim(),
    email: z.string().email(),
    password: z.string().min(8).max(32)
    .regex(/[a-z]/,"Must include a lowercase letter")
    .regex(/[A-Z]/,"Must include a uppercase letter")
    .regex(/[0-9]/,"Must contain at least one number")
    .regex(/\W|_/,"Must include a special character")
})