import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentsService, PaymentRecord } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Req() req: any): Promise<PaymentRecord[]> {
    return this.paymentsService.findAll(req.tenantId);
  }

  @Post(':id/verify')
  async verifyPayment(
    @Param('id') id: string,
    @Body() body: { trxId?: string },
    @Req() req: any,
  ): Promise<PaymentRecord> {
    return this.paymentsService.verifyPayment(id, body?.trxId, req.tenantId);
  }
}
