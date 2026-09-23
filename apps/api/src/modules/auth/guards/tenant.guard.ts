import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required before tenant authorization');
    }

    // Determine requested business/tenant ID from header, query, body, or params
    const requestedTenantId =
      request.headers['x-tenant-id'] ||
      request.query?.businessId ||
      request.body?.businessId ||
      request.params?.businessId;

    // Validate membership against BusinessMember
    const membership = await this.authService.validateBusinessMembership(user.id, requestedTenantId);

    if (!membership.isMember) {
      throw new ForbiddenException(
        `User ${user.email} (${user.id}) is not a verified member of business/tenant: ${membership.targetBusinessId}`,
      );
    }

    // Verify Business Approval Status (Only APPROVED is allowed; PENDING, REJECTED, SUSPENDED blocked)
    const status = membership.businessStatus;
    if (!status || status !== 'APPROVED') {
      throw new ForbiddenException(
        `Access denied. Business/tenant ${membership.targetBusinessId} is ${status || 'UNAPPROVED'}. Access is restricted to APPROVED businesses only.`,
      );
    }

    // Attach verified tenant information to request context
    request.tenantId = membership.targetBusinessId;
    request.tenantRole = membership.role;
    request.businessId = membership.targetBusinessId;

    return true;
  }
}
