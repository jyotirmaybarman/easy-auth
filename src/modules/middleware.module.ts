import { NextFunction, Request, Response } from "express";

export class Middleware{
    static verifyTokenMiddleware(req: Request, res: Response, next: NextFunction){
        console.log("In verify token middleware");
        next();
    }
}