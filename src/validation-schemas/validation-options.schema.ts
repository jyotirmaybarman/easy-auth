import z from "zod";

export const ValidateOptionsSchema = z.object({
    mode: z.enum(["strict", "strip", "passthrough"]),
})
.default({ mode: "passthrough" })

export type ValidateOptionsDto = z.infer<typeof ValidateOptionsSchema>