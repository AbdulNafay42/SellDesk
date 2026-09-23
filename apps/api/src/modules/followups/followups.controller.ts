import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('followups')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Get()
  async getLeads(@Req() req: any) {
    return this.followupsService.getLeads(req.tenantId);
  }

  @Post(':id/trigger')
  async triggerFollowup(@Param('id') id: string, @Req() req: any) {
    return this.followupsService.triggerFollowup(id, req.tenantId);
  }
}
