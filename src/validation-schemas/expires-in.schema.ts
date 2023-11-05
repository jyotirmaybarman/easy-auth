import z from "zod";
import { MsStringType } from '../types/ms-string.type';

export const ExpiresInSchema = z.object({
    expiresIn: z.string().or(z.number())
})

export type ExpiresInDto = z.infer<typeof ExpiresInSchema> & { expiresIn: MsStringType }
