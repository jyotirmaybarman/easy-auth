import { NextFunction, Request, Response } from "express";

export class Validation{
    static validateRegistrationInput(req: Request, res: Response, next: NextFunction){
        console.log("In validate reg input");
        return next();
    }
}