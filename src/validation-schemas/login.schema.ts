import z from "zod";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(32)
    .regex(/[a-z]/,"invalid email or password")
    .regex(/[A-Z]/,"invalid email or password")
    .regex(/[0-9]/,"invalid email or password")
    .regex(/\W|_/,"invalid email or password")
})


export type LoginDto = z.infer<typeof LoginSchema>;