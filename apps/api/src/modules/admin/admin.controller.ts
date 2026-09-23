import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService, ClientTenantBrand, PlatformMetrics } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { RejectBusinessDto } from './dto/reject-business.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending-businesses')
  async getPendingBusinesses() {
    return this.adminService.getPendingBusinesses();
  }

  @Patch('businesses/:id/approve')
  async approveBusiness(@Param('id') id: string) {
    return this.adminService.approveBusiness(id);
  }

  @Patch('businesses/:id/reject')
  async rejectBusiness(@Param('id') id: string, @Body() dto: RejectBusinessDto) {
    return this.adminService.rejectBusiness(id, dto.reason);
  }

  @Get('metrics')
  async getMetrics(): Promise<PlatformMetrics> {
    return this.adminService.getMetrics();
  }

  @Get('tenants')
  async getTenants(): Promise<ClientTenantBrand[]> {
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
  async toggleStatus(@Param('id') id: string): Promise<ClientTenantBrand> {
    return this.adminService.toggleStatus(id);
  }
}

