import { Controller, Get } from '@nestjs/common';
import { AnalyticsService, AnalyticsMetrics } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  getMetrics(): AnalyticsMetrics {
    return this.analyticsService.getMetrics();
  }
}
