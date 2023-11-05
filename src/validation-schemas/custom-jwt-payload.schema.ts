import z from "zod";

export const CustomJwtPayloadSchema = z.object({
    email: z.string().email(),
    sub: z.string().uuid()
})

export type CustomJwtPayloadDto = z.infer<typeof CustomJwtPayloadSchema>