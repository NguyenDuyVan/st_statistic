import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest();
    const authHeader: string = request.headers["authorization"] ?? "";

    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing token");
    }

    const token = authHeader.slice(7);
    const payload = this.authService.verifyToken(token);
    request.user = payload;
    return true;
  }
}
