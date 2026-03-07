import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  /** Constant-time string compare to prevent timing attacks */
  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still run comparison to keep timing consistent
      crypto.timingSafeEqual(
        Buffer.alloc(bufA.length),
        Buffer.alloc(bufA.length),
      );
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  login(
    username: string,
    password: string,
  ): { accessToken: string; username: string } {
    const expectedUsername = process.env.DEFAULT_USERNAME ?? "admin";
    const expectedPassword = process.env.DEFAULT_PASSWORD ?? "changeme";

    const usernameOk = this.safeEqual(username, expectedUsername);
    const passwordOk = this.safeEqual(password, expectedPassword);

    if (!usernameOk || !passwordOk) {
      throw new UnauthorizedException("Sai tên đăng nhập hoặc mật khẩu");
    }

    const payload = { sub: username, username };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, username };
  }

  verifyToken(token: string): { sub: string; username: string } {
    try {
      return this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
    }
  }
}
