import z from "zod";
import { CustomJwtPayloadSchema } from "./custom-jwt-payload.schema";

export const UpdateEmailSchema = CustomJwtPayloadSchema.extend({
    new_email: z.string().email()
})

export type UpdateEmailDto = z.infer<typeof UpdateEmailSchema>;