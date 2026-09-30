import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PaymentRecord {
  id: string;
  businessId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  amountPKR: number;
  status: string;
  trxId?: string;
  date: any;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return await this.prisma.paymentRecord.findMany({
      where: { businessId },
      orderBy: { date: 'desc' },
    });
  }

  async verifyPayment(id: string, trxId?: string, businessId?: string) {
    const payment = await this.prisma.paymentRecord.findFirst({
      where: {
        id,
        ...(businessId ? { businessId } : {}),
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record #${id} not found`);
    }

    return await this.prisma.paymentRecord.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        ...(trxId ? { trxId } : {}),
        notes: `Verified manually by Seller on ${new Date().toLocaleTimeString()}`,
      },
    });
  }
}

