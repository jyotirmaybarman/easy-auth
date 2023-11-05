import z from "zod";
import { ExpiresInSchema, ExpiresInDto } from './expires-in.schema';

export const RegistrationOptionsSchema = ExpiresInSchema.extend({
    withVerificationToken: z.boolean(),
    skipVerification: z.boolean()
})
.default({ expiresIn: "24h", skipVerification: false, withVerificationToken: true })

export type RegistrationOptionsDto = z.infer<typeof RegistrationOptionsSchema> & ExpiresInDto;