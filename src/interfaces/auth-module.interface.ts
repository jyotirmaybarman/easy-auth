import { AuthResponseType } from "../types/auth-response.type";
import { UserType } from "../types/user.type"
import { CustomJwtPayloadDto } from "../validation-schemas/custom-jwt-payload.schema";
import { EmailDto } from "../validation-schemas/email.schema";
import { ExpiresInDto } from "../validation-schemas/expires-in.schema";
import { LoginOptionsDto } from "../validation-schemas/login-options.schema";
import { LoginDto } from "../validation-schemas/login.schema";
import { RegistrationOptionsDto } from "../validation-schemas/registration-options.schema";
import { RegistrationDto } from "../validation-schemas/registration.schema";
import { ResetPasswordDto } from "../validation-schemas/reset-password.schema";
import { TokenDto } from "../validation-schemas/token.schema";
import { UpdateAccountDto } from "../validation-schemas/update-account.schema";
import { UpdateEmailDto } from "../validation-schemas/update-email.schema";

export interface AuthModuleInterface{

    register(input: RegistrationDto, options?: Partial<RegistrationOptionsDto>): AuthResponseType<{ user: UserType }>;

    generateVerificationToken(input: EmailDto, options?: Partial<ExpiresInDto>): AuthResponseType<{ verification_token: string }>;

    verifyEmail(input: TokenDto): AuthResponseType<{}>;

    login(input: LoginDto, options?: Partial<LoginOptionsDto>):AuthResponseType<{ access_token: string; refresh_token: string; user:UserType; }>
        
    generateAccessToken(input: TokenDto, options?: Partial<ExpiresInDto>): AuthResponseType<{ access_token: string }>;

    generatePasswordResetToken(input: EmailDto, options?: Partial<ExpiresInDto>): AuthResponseType<{ reset_token: string }>;
    
    resetPassword(input: ResetPasswordDto): AuthResponseType<{ user: UserType }>;

    generateEmailUpdateToken(input: UpdateEmailDto, options?: Partial<ExpiresInDto>): AuthResponseType<{ verification_token: string }>;

    verifyNewEmail(input: TokenDto): AuthResponseType<{ user: UserType }>;

    updateAccount(input: UpdateAccountDto, filter: CustomJwtPayloadDto): AuthResponseType<{ user: UserType }>;

}