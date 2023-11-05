import { UserType } from "../types/user.type";
import { InstanceConfigType } from "../types/instance-config.type";
import { AuthResponseType } from "../types/auth-response.type";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Cache, CacheKeysEnum } from "./cache.module";
import ms from "ms";
import z, { SafeParseSuccess, ZodError } from "zod";
import { CustomJwtPayloadDto, CustomJwtPayloadSchema } from '../validation-schemas/custom-jwt-payload.schema';
import { ExpiresInDto, ExpiresInSchema } from "../validation-schemas/expires-in.schema";
import { AuthModuleInterface } from "../interfaces/auth-module.interface";
import { RegistrationDto, RegistrationSchema } from "../validation-schemas/registration.schema";
import { LoginOptionsDto, LoginOptionsSchema } from "../validation-schemas/login-options.schema";
import { EmailDto, EmailSchema } from "../validation-schemas/email.schema";
import { TokenDto, TokenSchema } from "../validation-schemas/token.schema";
import { LoginDto, LoginSchema } from "../validation-schemas/login.schema";
import { ResetPasswordDto, ResetPasswordSchema } from '../validation-schemas/reset-password.schema';
import { UpdateEmailDto, UpdateEmailSchema } from "../validation-schemas/update-email.schema";
import { UpdateAccountDto, UpdateAccountSchema } from "../validation-schemas/update-account.schema";
import { RegistrationOptionsDto, RegistrationOptionsSchema } from "../validation-schemas/registration-options.schema";

export class Auth implements AuthModuleInterface {
  constructor(private readonly config: InstanceConfigType) {}

  async register(input: RegistrationDto, options?: Partial<RegistrationOptionsDto>): AuthResponseType<{ user: UserType }>{
    const inputValidation = await RegistrationSchema.safeParseAsync(input);
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation;

    const optionsValidation = await RegistrationOptionsSchema.safeParseAsync({ ...RegistrationOptionsSchema.parse(undefined), ...options })
    if(!optionsValidation.success) return this.formatZodErrorAndSend(optionsValidation.error) 
    const { data: OPTIONS } = optionsValidation as SafeParseSuccess<RegistrationOptionsDto>

    const existing = await this.config.adapter.findUser({ email: data.email });
    if (existing) return { success: false, errorCode: 409, message: "user already exists" };
    const hashedPassword = await bcryptjs.hash(data.password, 12);
    const user = await this.config.adapter.createUser({
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      email: data.email,
      password: hashedPassword,
      ...(OPTIONS.skipVerification && { verified: true }),
    });
    if(!user) return this.internalError()
    if (!OPTIONS.skipVerification && OPTIONS.withVerificationToken) {
      const verification_token = this.signToken("verification", { email: user.email, sub: user.id }, { expiresIn: OPTIONS.expiresIn });
      const updatedUser = await this.config.adapter.updateUser({ email: user.email }, { verification_token });
      if(!updatedUser) return this.internalError()
      return this.sucess({ user: updatedUser });
      // return { success: true, user: updatedUser, message: "registration successful & verification token generated" };
    }
    // return { success: true, user, message: "registration successful" };
    return this.sucess({user});
  }

  async generateVerificationToken(input: EmailDto, options?: Partial<ExpiresInDto>): AuthResponseType<{ verification_token: string }>{
    const inputValidation = await EmailSchema.safeParseAsync(input)
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    const optionsValidation = await ExpiresInSchema.safeParseAsync({ ...ExpiresInSchema.parse(undefined), ...options })
    if(!optionsValidation.success) return this.formatZodErrorAndSend(optionsValidation.error)
    const { data: OPTIONS } = optionsValidation as SafeParseSuccess<ExpiresInDto>

    const user = await this.config.adapter.findUser({ email: data.email });
    if (!user) return this.notFound();
    const verification_token = this.signToken("verification", { email: user.email, sub: user.id }, { expiresIn: OPTIONS.expiresIn });
    if (!verification_token) return this.internalError("token sign error");
    await this.config.adapter.updateUser({ email: user.email },{ verification_token });
    return this.sucess({ verification_token })
  }

  async verifyEmail(input: TokenDto): AuthResponseType<{}>{
    const inputValidation = await TokenSchema.safeParseAsync(input);
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    try {
      const valid = jwt.verify(data.token, this.config.jwt.verification_secret) as CustomJwtPayloadDto;
      const user = await this.config.adapter.updateUser({ email: valid.email, verification_token: data.token }, { verified: true, verification_token: null });
      if(!user) return this.notFound()
      return this.sucess({})
    } catch (error) {
      return this.badRequest("invalid verification token")
    }
  }

  async login(input: LoginDto, options?: LoginOptionsDto): AuthResponseType<{ access_token: string; refresh_token: string; user:UserType; }>{
    const inputValidation = await LoginSchema.safeParseAsync(input);
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    const optionsValidation = await LoginOptionsSchema.safeParseAsync({ ...LoginOptionsSchema.parse(undefined), ...options })
    
    if(!optionsValidation.success) return this.formatZodErrorAndSend(optionsValidation.error)
    const { data: OPTIONS } = optionsValidation as SafeParseSuccess<LoginOptionsDto>

    const user = await this.config.adapter.findUser({ email: data.email, verified: true });
    if (!user) return this.notFound();

    const match = await bcryptjs.compare(data.password, user.password);
    if (!match) return this.badRequest("invalid credentials");

    let access_token = this.signToken("access", { email: user.email, sub: user.id }, { expiresIn: OPTIONS.accessTokenExpiry });
    let refresh_token = this.signToken("refresh", { email: user.email, sub: user.id }, { expiresIn: OPTIONS.refreshTokenExpiry });

    if(!access_token || !refresh_token) return this.internalError("token sign error");

    let key = CacheKeysEnum.REFRESH_PREFIX + user.id;
    if (OPTIONS.allowMultipleLogin) {
      const token = await Cache.adapter.get(key);
      refresh_token = token ? token + "," + refresh_token : refresh_token;
    }
    await Cache.adapter.set(key, refresh_token, ms(OPTIONS.refreshTokenExpiry));
    return this.sucess({ refresh_token, access_token, user });
  }
      
  async generateAccessToken(input: TokenDto, options?: ExpiresInDto): AuthResponseType<{ access_token: string }>{
    const inputValidation = await TokenSchema.safeParseAsync(input);
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    const optionsValidation = await ExpiresInSchema.safeParseAsync({ ...ExpiresInSchema.default({ expiresIn: "15m" }).parse(undefined), ...options })
    if(!optionsValidation.success) return this.formatZodErrorAndSend(optionsValidation.error)
    const { data: OPTIONS } = optionsValidation as SafeParseSuccess<ExpiresInDto>
    try {
      const valid = jwt.verify(data.token, this.config.jwt.verification_secret) as CustomJwtPayloadDto;
      let key = CacheKeysEnum.REFRESH_PREFIX + valid.sub
      const refreshTokens = await Cache.adapter.get<string>(key)
      if(!refreshTokens) return this.badRequest("invalid token")
      const refTokensArr = refreshTokens.split(",");
      if(!refTokensArr.includes(data.token)) return this.badRequest("invalid token")
      const access_token = this.signToken("access", { email: valid.email, sub: valid.sub }, { expiresIn: OPTIONS.expiresIn });
      if(!access_token) return this.internalError("token sign error")

      return this.sucess({ access_token })

    } catch (error) {
      return this.badRequest();
    }
  }

  async generatePasswordResetToken(input: EmailDto, options?: ExpiresInDto): AuthResponseType<{ reset_token: string }>{
    const inputValidation = await EmailSchema.safeParseAsync(input)
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    const optionsValidation = await ExpiresInSchema.safeParseAsync({ ...ExpiresInSchema.parse(undefined), ...options })
    if(!optionsValidation.success) return this.formatZodErrorAndSend(optionsValidation.error)
    const { data: OPTIONS } = optionsValidation as SafeParseSuccess<ExpiresInDto>

    const user = await this.config.adapter.findUser({ email: data.email }, ["email"])

    if(!user) return this.notFound();

    const reset_token = this.signToken("verification", { email: data.email, sub: data.email }, OPTIONS )
    if(!reset_token) return this.internalError("token sign error")

    await this.config.adapter.updateUser({ email: user.email }, { reset_token });

    return this.sucess({ reset_token })
  }
  
  async resetPassword(input: ResetPasswordDto): AuthResponseType<{ user: UserType }>{
    const inputValidation = await ResetPasswordSchema.safeParseAsync(input)
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    try {
      const valid = jwt.verify(data.token, this.config.jwt.verification_secret) as CustomJwtPayloadDto;
      const user = await this.config.adapter.findUser({ email: valid.email, reset_token: data.token });
      if(!user) return this.notFound();
      const updatedUser = await this.config.adapter.updateUser({ email: user.email }, { password: await bcryptjs.hash(data.new_password, 12), reset_token: null });
      if(!updatedUser) return this.internalError();
      return this.sucess({ user: updatedUser })
    } catch (error) {
      return this.badRequest("invalid token");
    }

  }

  async generateEmailUpdateToken(input: UpdateEmailDto, options?: ExpiresInDto): AuthResponseType<{ verification_token: string }>{
    const inputValidation = await UpdateEmailSchema.safeParseAsync(input)
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    const optionsValidation = await ExpiresInSchema.safeParseAsync({ ...ExpiresInSchema.parse(undefined), ...options })
    if(!optionsValidation.success) return this.formatZodErrorAndSend(optionsValidation.error)
    const { data: OPTIONS } = optionsValidation as SafeParseSuccess<ExpiresInDto>

    const user = await this.config.adapter.findUser({ email: data.email });
    if(!user) return this.notFound()

    const verification_token = this.signToken("verification", { email: data.email, sub: data.email }, OPTIONS )
    if(!verification_token) return this.internalError("token sign error")

    const updatedUser = await this.config.adapter.updateUser({ email: user.email }, { verification_token, new_email: data.new_email });
    if(!updatedUser) return this.internalError();

    return this.sucess({ verification_token })
  }

  async verifyNewEmail(input: TokenDto): AuthResponseType<{ user: UserType }>{
    const inputValidation = await TokenSchema.safeParseAsync(input)
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation

    try {
      const valid = jwt.verify(data.token, this.config.jwt.verification_secret) as CustomJwtPayloadDto;
      const user = await this.config.adapter.updateUser({ email: valid.email, verification_token: data.token }, { new_email: null, verification_token: null });
      if(!user) return this.notFound();
      return this.sucess({ user })
    } catch (error) {
      return this.badRequest("invalid token");
    }

  }

  async updateAccount(input: UpdateAccountDto, filter: CustomJwtPayloadDto ): AuthResponseType<{ user: UserType }>{
    const inputValidation = await UpdateAccountSchema.safeParseAsync(input)
    if(!inputValidation.success) return this.formatZodErrorAndSend(inputValidation.error)
    const { data } = inputValidation
    
    const filterValidation = await CustomJwtPayloadSchema.safeParseAsync(filter)
    if(!filterValidation.success) return this.formatZodErrorAndSend(filterValidation.error)
    const { data: FILTER } = filterValidation

    const user = await this.config.adapter.updateUser({ email: FILTER.email, id: FILTER.sub }, data)
    if(!user) return this.notFound();
    return this.sucess({ user })
  }
 
  // private helpers
  private signToken(type: "access" | "refresh" | "verification", data: CustomJwtPayloadDto, options?: ExpiresInDto): string | undefined {
    try {
      let OPTIONS = ExpiresInSchema.default({ expiresIn: "24h" }).parse(options);
      if (type === "refresh") {
        OPTIONS = ExpiresInSchema.default({ expiresIn: "7d" }).parse(options);
        return jwt.sign(data, this.config.jwt.refresh_token_secret, OPTIONS);
      } else if (type == "access") {
        OPTIONS = ExpiresInSchema.default({ expiresIn: "15m" }).parse(options);
        return jwt.sign(data, this.config.jwt.access_token_secret, OPTIONS);
      }
      return jwt.sign(data, this.config.jwt.verification_secret, OPTIONS);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  private formatZodError<T>(error: ZodError<T>){
    return error.flatten((issue: any) => issue.message)
  }

  private formatZodErrorAndSend<T>(error: ZodError<T>): { success: false, errorCode: number, message: string | z.typeToFlattenedError<any>}{
    return { success: false, errorCode: 422, message: this.formatZodError(error) }
  }

  private badRequest(message: string = "bad request"):{success: false, errorCode: number, message: string}{
    return { success: false, errorCode: 400, message }
  }
  private internalError(message: string = "something went wrong"):{success: false, errorCode: number, message: string}{
    return { success: false, errorCode: 500, message }
  }
  private notFound(message: string = "not found"):{success: false, errorCode: number, message: string}{
    return { success: false, errorCode: 404, message }
  }
  private sucess<T>(data: T):T & {success: true, message: string}{
    return { success: true, message: "sucess", ...data }
  }
}
