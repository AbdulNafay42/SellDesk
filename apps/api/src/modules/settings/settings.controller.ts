import { Controller, Get, Put, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService, BusinessProfile, TeamMember, SubscriptionBilling } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  async getBusiness(@Req() req: any): Promise<BusinessProfile> {
    return this.settingsService.getBusiness(req.tenantId);
  }

  @Put('business')
  async updateBusiness(@Body() dto: Partial<BusinessProfile>, @Req() req: any): Promise<BusinessProfile> {
    return this.settingsService.updateBusiness(dto, req.tenantId);
  }

  @Get('team')
  async getTeam(@Req() req: any): Promise<TeamMember[]> {
    return this.settingsService.getTeam(req.tenantId);
  }

  @Post('team/invite')
  async inviteTeamMember(
    @Body() body: { name: string; email: string; role: 'OWNER' | 'ADMIN' | 'SALES_AGENT' | 'INVENTORY_MANAGER' },
    @Req() req: any,
  ): Promise<TeamMember> {
    return this.settingsService.inviteTeamMember(body, req.tenantId);
  }

  @Get('billing')
  async getBilling(@Req() req: any): Promise<SubscriptionBilling> {
    return this.settingsService.getBilling(req.tenantId);
  }
}
