import { NextFunction, Request, Response } from "express";
import { InstanceConfigType } from "../types/instance-config.type";

export class Middleware {
  constructor(private readonly config: InstanceConfigType) {}
  verifyAccessToken() {
    return async (req: Request, res: Response, next: NextFunction) => {
      console.log("In verify token middleware");
      console.log(this.config);
      next();
    };
  }
}
