import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateOrderDto {
  businessId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  productName: string;
  variantInfo: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}



  async findAll(businessId: string, status?: string) {
    return await this.prisma.order.findMany({
      where: {
        businessId,
        ...(status && status !== 'ALL' ? { status: status as any } : {}),
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, businessId: string) {
    const existing = await this.prisma.order.findFirst({
      where: { id, businessId },
    });
    if (!existing) throw new NotFoundException('Order not found');

    return await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async create(dto: CreateOrderDto) {
    let customer = await this.prisma.customer.findFirst({
      where: { businessId: dto.businessId, phoneNumber: dto.customerPhone || '03000000000' },
    });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          businessId: dto.businessId,
          fullName: dto.customerName || 'Walk-in Customer',
          phoneNumber: dto.customerPhone || '03000000000',
          city: dto.city || 'Lahore',
          address: dto.address || '',
        },
      });
    }

    const shippingFee = 250;
    const subtotal = dto.totalAmount || 0;
    const totalAmount = subtotal + shippingFee;
    const orderNumber = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const createdOrder = await this.prisma.order.create({
      data: {
        businessId: dto.businessId,
        customerId: customer.id,
        orderNumber,
        status: 'NEW',
        paymentStatus: 'PENDING',
        paymentMethod: dto.paymentMethod || 'COD',
        subtotal,
        shippingFee,
        totalAmount,
        notes: dto.notes || null,
      },
      include: { customer: true },
    });

    return {
      ...createdOrder,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      city: customer.city,
      address: customer.address,
    };
  }
}

