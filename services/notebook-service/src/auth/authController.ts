// src/auth/authController.ts

import { Controller, Post, Body, Route } from "tsoa";
import { AuthService } from "./authService";
import { LoginRequest, RegisterRequest, AuthResponse } from "./auth";

const authService = new AuthService();

@Route("auth")
export class AuthController extends Controller {
  @Post("register")
  public async register(@Body() body: RegisterRequest): Promise<AuthResponse> {
    return authService.register(body);
  }

  @Post("login")
  public async login(@Body() body: LoginRequest): Promise<AuthResponse> {
    const result = await authService.login(body);

    if (!result) {
      this.setStatus(401);
      throw new Error("Invalid credentials");
    }

    return result;
  }
}
