import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const secret = process.env.JWT_SECRET || 'selldesk_jwt_secret_dev_key_2026';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      // Attach authenticated user identity to request.user
      request.user = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        platformRole: payload.platformRole || 'USER',
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
