import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { AdminService, ClientTenantBrand, PlatformMetrics } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  getMetrics(): PlatformMetrics {
    return this.adminService.getMetrics();
  }

  @Get('tenants')
  getTenants(): ClientTenantBrand[] {
    return this.adminService.getTenants();
  }

  @Post('tenants/provision')
  provisionTenant(
    @Body()
    body: {
      name: string;
      ownerName: string;
      ownerEmail: string;
      whatsappPhone: string;
      city: string;
      plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
    },
  ): ClientTenantBrand {
    return this.adminService.provisionTenant(body);
  }

  @Patch('tenants/:id/status')
  toggleStatus(@Param('id') id: string): ClientTenantBrand {
    return this.adminService.toggleStatus(id);
  }
}
