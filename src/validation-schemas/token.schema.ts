import z from "zod";

export const TokenSchema = z.object({
  token: z.string(),
});

export type TokenDto = z.infer<typeof TokenSchema>;
