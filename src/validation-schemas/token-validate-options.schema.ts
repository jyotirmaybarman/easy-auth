import z from "zod";

export const TokenValidateOptionsSchema = z.object({
    extractFrom: z.literal("cookies").or(z.literal("bearer")),
    tokenIdentifier: z.string()
})

export type TokenValidateOptionsDto = { extractFrom : "bearer" } | { extractFrom : "cookies", tokenIdentifier: string}