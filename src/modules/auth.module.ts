 import { UserType } from "../types/user.type";
import { ExpiryType } from "../types/expiry.type";
import { InstanceConfigType } from "../types/instance-config.type";
import { CreateUserType } from "../types/create-user.type";
import { AuthResponseType } from "../types/auth-response.type";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { Cache, CacheKeysEnum } from "./cache.module";
import { JwtResponseType } from "../types/jwt-response.type";
import ms from "ms"
import { MsStringType } from "../types/ms-string.type";




export class Auth {
  private readonly adaptor;
  private readonly jwtConfig;
  constructor(config: InstanceConfigType) {
    this.adaptor = config.adapter;
    this.jwtConfig = config.jwt;
  }

  async register(
    data: CreateUserType,
    options: ExpiryType & {
      withVerificationToken: boolean;
      skipVerification?: boolean;
    } = { withVerificationToken: true, expiresIn: "24h" }
  ): Promise<AuthResponseType<UserType>> {    
    const existing = await this.adaptor.findUser({ email: data.email });

    if (existing) return { success: false, message: "user already exists", errorCode: 409 };

    const hashedPassword = await bcryptjs.hash(data.password, 12);
    const verification_token = options.withVerificationToken
      ? this.signVerificationToken(data.email, { expiresIn: options.expiresIn })
      : null;

    const user = await this.adaptor.createUser({
      ...data,
      password: hashedPassword,
      verification_token,
      ...(options.skipVerification && { verified: true }),
    });

    return { success: true, data: { user }, message: "registered" };
  }

  async generateVerificationToken(
    email: string,
    options: ExpiryType = { expiresIn: "24h" }
  ): Promise<AuthResponseType<UserType>> {
    return await this.regenerateVerificationToken(email, options);
  }

  async regenerateVerificationToken(
    email: string,
    options: ExpiryType = { expiresIn: "24h" }
  ): Promise<AuthResponseType<UserType>> {
    const user = await this.adaptor.findUser({ email });
    if (!user)
      return { success: false, message: "user not found", errorCode: 404 };
    const verification_token = this.signVerificationToken(email, {
      expiresIn: options.expiresIn,
    });
    const updatedUser = await this.adaptor.updateUser(
      { email: user.email },
      { verification_token }
    );
    return {
      success: true,
      data: { user: updatedUser, verification_token },
      message: "verification token generated",
    };
  }

  async verifyEmail(token: string): Promise<AuthResponseType<UserType>> {
    try {
      const valid = jwt.verify(token, this.jwtConfig.email_verification_secret) as JwtResponseType;
      const user = await this.adaptor.findUser({ email: valid.email, verification_token: token });
      if (!user) return { success: false, errorCode: 404, message: "user not found" };
      if (user.verification_token == token) {
        const updatedUser = await this.adaptor.updateUser(
          { id: user.id },
          { verified: true, verification_token: null }
        );
        return {
          success: true,
          data: { user: updatedUser },
          message: "email verified",
        };
      }
      return { success: false, message: "invalid token" };
    } catch (error) {
      console.log(error);
      return { success: false, errorCode: 401, message: "invalid token" };
    }
  }

  async login(
    data: { email: string; password: string },
    options: {
      refreshTokenExpiry: MsStringType;
      accessTokenExpiry: MsStringType;
      allowMultipleLogin?: boolean;
    } = { refreshTokenExpiry: "7d", accessTokenExpiry: "15m", allowMultipleLogin: false }
  ): Promise<AuthResponseType<UserType>> {
    const user = await this.adaptor.findUser({ email: data.email });
    if (!user) return { success: false, errorCode: 404, message: "user not found" };

    const match = await bcryptjs.compare(data.password, user.password);
    if (!match) return { success: false, errorCode: 401, message: "invalid credentials" };

    let access_token = this.signToken("access", user.id, {
      expiresIn: options.accessTokenExpiry,
    });
    let refresh_token = this.signToken("refresh", user.id, {
      expiresIn: options.refreshTokenExpiry,
    });

    if (Cache.initialized) {
      let key = CacheKeysEnum.REFRESH_PREFIX + user.id
      if(options.allowMultipleLogin){
        const token = await Cache.adapter.get(key);
        refresh_token = token ? token + "," + refresh_token : refresh_token;
      }
      await Cache.adapter.set(key, refresh_token, ms(options.refreshTokenExpiry));
    }

    return {
      success: true,
      data: { user, access_token, refresh_token },
      message: "login successful",
    };
  }

  async regenerateAccessToken(refresh_token: string, options: ExpiryType = { expiresIn: "15m" }): Promise<AuthResponseType<UserType>> {
    try {
      const valid = jwt.verify(refresh_token, this.jwtConfig.refresh_token_secret) as JwtResponseType;
      if(valid && valid.sub) {
        const token = await Cache.adapter.get(CacheKeysEnum.REFRESH_PREFIX + valid.sub);
        if(token && token == refresh_token){
          const access_token = this.signToken("access", valid.sub, options)
          return { success: true, data:{ access_token }, message: "access token regenerated" }
        }
      } 
      return { success: false, message: "invalid token" }
    } catch (error) {
      return { success: false, message: "invalid token" }
    }
  }

  private signVerificationToken(email: string, options: ExpiryType): string {
    return jwt.sign({ email }, this.jwtConfig.email_verification_secret, options);
  }

  private signToken(
    type: "access" | "refresh",
    sub: string,
    options: ExpiryType
  ): string {
    if (type === "refresh") {
      return jwt.sign({ sub }, this.jwtConfig.refresh_token_secret, options);
    }
    return jwt.sign({ sub }, this.jwtConfig.access_token_secret, options);
  }
}
