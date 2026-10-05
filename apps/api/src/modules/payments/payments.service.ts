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
    if (!businessId) return [];

    const existingPayments = await this.prisma.paymentRecord.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    const orders = await this.prisma.order.findMany({
      where: { businessId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    const missingOrders = orders.filter(
      (o) => !existingPayments.some((p) => p.orderNumber === o.orderNumber)
    );

    if (missingOrders.length > 0) {
      for (const order of missingOrders) {
        const createdPayment = await this.prisma.paymentRecord.create({
          data: {
            businessId,
            orderNumber: order.orderNumber,
            customerName: order.customer?.fullName || 'Walk-in Customer',
            customerPhone: order.customer?.phoneNumber || 'N/A',
            paymentMethod: order.paymentMethod || 'COD',
            amountPKR: order.totalAmount || 0,
            status: order.status === 'DELIVERED' || order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING_VERIFICATION',
            date: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
            notes: `Auto-synced from Order ${order.orderNumber}`,
          },
        });
        existingPayments.unshift(createdPayment);
      }
    }

    return existingPayments;
  }

  async verifyPayment(id: string, businessId: string, trxId?: string) {
    const payment = await this.prisma.paymentRecord.findFirst({
      where: {
        id,
        businessId,
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


