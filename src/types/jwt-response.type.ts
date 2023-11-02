import { JwtPayload } from 'jsonwebtoken';

export type JwtResponseType = JwtPayload &{
    email?: string;
    sub?: string; 
}