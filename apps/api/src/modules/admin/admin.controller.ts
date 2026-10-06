import { Controller, Get, Post, Patch, Param, Query, Body, Request, UseGuards } from '@nestjs/common';
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
  async provisionTenant(
    @Body()
    body: {
      name: string;
      ownerName: string;
      ownerEmail: string;
      whatsappPhone: string;
      city: string;
      plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
    },
  ): Promise<ClientTenantBrand> {
    return this.adminService.provisionTenant(body);
  }

  @Patch('tenants/:id/status')
  async toggleStatus(@Param('id') id: string): Promise<ClientTenantBrand> {
    return this.adminService.toggleStatus(id);
  }

  // Phase 3: Users Management
  @Get('users')
  async getUsers(@Query('search') search?: string, @Query('role') role?: string) {
    return this.adminService.getUsers(search, role);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  // Phase 4: Integrations Monitoring
  @Get('integrations')
  async getIntegrationsSummary() {
    return this.adminService.getIntegrationsSummary();
  }

  // Phase 5: Billing & Usage
  @Get('billing/summary')
  async getBillingSummary() {
    return this.adminService.getBillingSummary();
  }

  @Get('usage')
  async getUsageSummary() {
    return this.adminService.getUsageSummary();
  }

  // Phase 6: Platform Analytics
  @Get('analytics')
  async getPlatformAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  // Phase 7: Support — Strictly Read-Only Inspectors
  @Get('support/conversations')
  async getSupportConversations(@Query('q') q?: string) {
    return this.adminService.getSupportConversations(q);
  }

  @Get('support/orders')
  async getSupportOrders(@Query('q') q?: string) {
    return this.adminService.getSupportOrders(q);
  }

  @Get('support/products')
  async getSupportProducts(@Query('q') q?: string) {
    return this.adminService.getSupportProducts(q);
  }

  // Phase 8: Notifications
  @Get('notifications')
  async getNotifications() {
    return this.adminService.getNotifications();
  }

  // Phase 9: Real System Health
  @Get('system-health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // Phase 10: Security & Audit Logs
  @Get('security/audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Get('security/webhook-logs')
  async getWebhookLogs() {
    return this.adminService.getWebhookLogs();
  }

  // Phase 11: Platform Settings & Feature Flags
  @Get('settings')
  async getPlatformSettings() {
    return this.adminService.getPlatformSettings();
  }

  @Patch('settings')
  async updatePlatformSetting(@Body() body: { key: string; value: string }, @Request() req: any) {
    return this.adminService.updatePlatformSetting(body.key, body.value, req.user);
  }

  @Get('feature-flags')
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Patch('feature-flags/:key')
  async toggleFeatureFlag(@Param('key') key: string, @Body() body: { isEnabled: boolean }, @Request() req: any) {
    return this.adminService.toggleFeatureFlag(key, body.isEnabled, req.user);
  }
}


