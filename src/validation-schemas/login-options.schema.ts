import z from "zod";
import { MsStringType } from "../types/ms-string.type";

export const LoginOptionsSchema = z.object({
    refreshTokenExpiry: z.string().or(z.number()),
    accessTokenExpiry: z.string().or(z.number()),
    allowMultipleLogin: z.boolean()
})
.default({ accessTokenExpiry: "15m", refreshTokenExpiry: "7d", allowMultipleLogin: false });

export type LoginOptionsDto = z.infer<typeof LoginOptionsSchema> & { 
    refreshTokenExpiry: MsStringType; 
    accessTokenExpiry: MsStringType; 
};