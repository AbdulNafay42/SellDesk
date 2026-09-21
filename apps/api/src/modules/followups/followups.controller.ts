import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { FollowupsService } from './followups.service';

@Controller('followups')
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Get()
  async getLeads(@Query('businessId') businessId?: string) {
    return this.followupsService.getLeads(businessId || 'biz-default');
  }

  @Post(':id/trigger')
  async triggerFollowup(@Param('id') id: string) {
    return this.followupsService.triggerFollowup(id);
  }
}
