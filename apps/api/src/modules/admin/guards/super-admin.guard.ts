import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required before admin access');
    }

    if (user.platformRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Platform Super Admin role required');
    }

    return true;
  }
}
