import { NextFunction, Request, Response } from "express";
import z from "zod";
import { CreateUserSchema } from "../validation-schemas/create-user.schema";
import { InstanceConfigType } from "../types/instance-config.type";

export class Validation {
  constructor(private readonly config: InstanceConfigType) {}

  public validateRegistrationInput() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const RegistrationInputSchema = CreateUserSchema.extend({
        password_confirmation: z.string(),
      }).refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ["password_confirmation"],
      });
      return this.sendResponse(RegistrationInputSchema, req, res, next);
    };
  }

  private sendResponse<T extends z.ZodTypeAny>(
    schema: T,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = schema.safeParse(req.body);
    if (!data.success) {
      return res.status(422).json({
        errors: data.error.flatten((issue) => issue.message).fieldErrors,
      });
    }
    return next();
  }
}
