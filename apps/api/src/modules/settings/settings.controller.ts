import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import { SettingsService, BusinessProfile, TeamMember, SubscriptionBilling } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('business')
  getBusiness(): BusinessProfile {
    return this.settingsService.getBusiness();
  }

  @Put('business')
  updateBusiness(@Body() dto: Partial<BusinessProfile>): BusinessProfile {
    return this.settingsService.updateBusiness(dto);
  }

  @Get('team')
  getTeam(): TeamMember[] {
    return this.settingsService.getTeam();
  }

  @Post('team/invite')
  inviteTeamMember(@Body() body: { name: string; email: string; role: 'OWNER' | 'ADMIN' | 'SALES_AGENT' | 'INVENTORY_MANAGER' }): TeamMember {
    return this.settingsService.inviteTeamMember(body);
  }

  @Get('billing')
  getBilling(): SubscriptionBilling {
    return this.settingsService.getBilling();
  }
}
