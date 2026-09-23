import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService, AnalyticsMetrics } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  async getMetrics(@Req() req: any): Promise<AnalyticsMetrics> {
    return this.analyticsService.getMetrics(req.tenantId);
  }
}
