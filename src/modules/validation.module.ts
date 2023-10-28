import { NextFunction, Request, Response } from "express";
import z from "zod";
import { CreateUserSchema } from "../valiation-schemas/create-user.schema";


export class Validation{
    private static sendResponse<T extends z.ZodTypeAny>(schema: T, req: Request, res: Response, next: NextFunction){
        const data = schema.safeParse(req.body);
        if(!data.success){
            return res.status(422).json({
                errors: data.error.flatten(issue => issue.message).fieldErrors
            });
        }
        return next();
    }

    static validateRegistrationInput(req: Request, res: Response, next: NextFunction){
        
        const RegistrationInputSchema = CreateUserSchema.extend({
            password_confirmation: z.string()
        })
        .refine((data) => data.password === data.password_confirmation, {
            message: "Passwords don't match",
            path: ["password_confirmation"]
        })

        return Validation.sendResponse(RegistrationInputSchema, req, res, next)
    }
}