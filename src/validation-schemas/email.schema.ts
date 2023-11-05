import z from "zod";

export const EmailSchema = z.object({
    email: z.string().email()
})

export type EmailDto = z.infer<typeof EmailSchema>;