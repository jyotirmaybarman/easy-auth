import z from "zod";

export const UpdateAccountSchema = z.object({
    first_name: z.string().min(1).max(50).regex(/^[a-zA-Z]+$/).trim(),
    middle_name: z.string().min(1).max(50).regex(/^[a-zA-Z]+$/).trim().optional(),
    last_name: z.string().min(1).max(50).regex(/^[a-zA-Z]+$/).trim()
})

export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>