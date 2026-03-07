import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(
      body.username?.trim() ?? "",
      body.password ?? "",
    );
  }

  /** FE uses this to validate stored token on app boot */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return { username: req.user.username };
  }
}
