import { NextFunction, Request, Response } from "express";
import { InstanceConfigType } from "../types/instance-config.type";
import jwt from 'jsonwebtoken';
import { CustomJwtPayloadDto } from "../validation-schemas/custom-jwt-payload.schema";
import { Cache, CacheKeysEnum } from "./cache.module";
import z from "zod";
import { UserType } from "../types/user.type";
import { TokenValidateOptionsDto, TokenValidateOptionsSchema } from "../validation-schemas/token-validate-options.schema";
import { RegistrationSchema } from "../validation-schemas/registration.schema";
import { ValidateOptionsDto, ValidateOptionsSchema } from "../validation-schemas/validation-options.schema";
import { LoginSchema } from "../validation-schemas/login.schema";

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
      data: CustomJwtPayloadDto,
      token?: string
    }
  }
}

export class Middleware {
  constructor(private readonly config: InstanceConfigType) {}
  validateAccessToken(options?: Partial<TokenValidateOptionsDto>) {
    const OPTIONS = TokenValidateOptionsSchema.parse({ extractFrom: "bearer", tokenIdentifier: "access_token", ...options })
    return async (req: Request, res: Response, next: NextFunction) => {

      let token = this.extractToken(req, OPTIONS);
      if (!token) return res.status(401).json({ message: "unauthorized" });
      try {
        const valid = jwt.verify(token, this.config.jwt.access_token_secret);
        if (!valid)
          return res.status(401).json({ message: "invalid access token" });
          req.token = token
        return next();
      } catch (error) {
        return res.status(401).json({ message: "invalid access token" });
      }
    };
  }

  validateRefreshToken(options?: Partial<TokenValidateOptionsDto>) {
    const OPTIONS = TokenValidateOptionsSchema.parse({ extractFrom: "cookies", tokenIdentifier: "refresh_token", ...options })
    return async (req: Request, res: Response, next: NextFunction) => {
      let token = this.extractToken(req, OPTIONS);
      if (!token) return res.status(401).json({ message: "unauthorized" });
      try {
        const valid = jwt.verify(
          token,
          this.config.jwt.refresh_token_secret
        ) as CustomJwtPayloadDto;
        if (!valid || !valid.sub)
          return res.status(401).json({ message: "invalid refresh token" });
        const key = CacheKeysEnum.REFRESH_PREFIX + valid.sub;
        const refreshTokenString: string | undefined = await Cache.adapter.get(key);
        if (!refreshTokenString) return res.status(401).json({ message: "invalid refresh token" });
        let tokensArr = refreshTokenString.split(",");
        if (!tokensArr.includes(token)) return res.status(401).json({ message: "invalid refresh token" });
        req.data = { ...valid };
        req.token = token
        return next();
      } catch (error) {
        return res.status(401).json({ message: "invalid refresh token" });
      }
    };
  }

  validateRegistrationInput(options?: ValidateOptionsDto) {
    return async (req: Request, res: Response, next: NextFunction) => {
      let extended = RegistrationSchema.extend({
        password_confirmation: z.string(),
      })
      const OPTIONS = ValidateOptionsSchema.parse({ mode: "passthrough", ...options })

      let afterStictCheck;
      if (OPTIONS.mode == "strict") {
        afterStictCheck = extended.strict();
      } else if(OPTIONS.mode == "passthrough"){
        afterStictCheck = extended.passthrough()
      } else{
        afterStictCheck = extended.strip()
      }
      const RegistrationInputSchema = afterStictCheck.refine((data) => data.password === data.password_confirmation, {
        message: "Passwords don't match",
        path: ["password_confirmation"]
      });
      return this.sendResponse(RegistrationInputSchema, req, res, next);
    };
  }

  validateLoginInput(options?: ValidateOptionsDto) {
    const OPTIONS = ValidateOptionsSchema.parse({ mode: "passthrough", ...options })

    let afterStictCheck;
    if (OPTIONS.mode == "strict") {
      afterStictCheck = LoginSchema.strict()
    } else if(OPTIONS.mode == "passthrough"){
      afterStictCheck = LoginSchema.passthrough()
    } else{
      afterStictCheck = LoginSchema.strip()
    }

    const NewLoginSchema = afterStictCheck.refine(val => val)
    return async (req: Request, res: Response, next: NextFunction) => {
      return this.sendResponse(NewLoginSchema, req, res, next);
    }
  }

  private extractToken(
    req: Request,
    options: TokenValidateOptionsDto
  ): string | undefined {
    if (options.extractFrom == "bearer") {
      return req.headers["authorization"]?.split(" ")[1];
    } else if (options.extractFrom == "cookies" && req.cookies) {
      return req.cookies[options.tokenIdentifier];
    }
    return undefined;
  }

  private sendResponse<T extends z.ZodTypeAny>(
    schema: T,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const data = schema.safeParse(req.body);
    if (!data.success) {
      return res.status(422).json(data.error.flatten((issue) => issue.message));
    }
    req.body = data.data; 
    return next();
  }

}
