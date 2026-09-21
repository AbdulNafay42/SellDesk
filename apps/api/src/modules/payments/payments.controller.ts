import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PaymentsService, PaymentRecord } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(): PaymentRecord[] {
    return this.paymentsService.findAll();
  }

  @Post(':id/verify')
  verifyPayment(@Param('id') id: string, @Body() body: { trxId?: string }): PaymentRecord {
    return this.paymentsService.verifyPayment(id, body?.trxId);
  }
}
