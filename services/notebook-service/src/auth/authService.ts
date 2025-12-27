// src/auth/authService.ts

import { PrismaClient } from "@notebooks.dev/db-client/notebooks-db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginRequest, RegisterRequest, AuthResponse } from "./auth";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export class AuthService {
  public async register(payload: RegisterRequest): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
      },
    });

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  public async login(payload: LoginRequest): Promise<AuthResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) return null;

    const valid = await bcrypt.compare(payload.password, user.password);
    if (!valid) return null;

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: "7d",
    });
  }
}
