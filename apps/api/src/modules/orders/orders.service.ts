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
    const orders = await this.prisma.order.findMany({
      where: {
        businessId,
        ...(status && status !== 'ALL' ? { status: status as any } : {}),
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o: any) => {
      let details: any = {};
      if (o.notes) {
        try {
          details = JSON.parse(o.notes);
        } catch {
          details = {};
        }
      }

      return {
        ...o,
        customerName: o.customer?.fullName || 'Walk-in Customer',
        customerPhone: o.customer?.phoneNumber || 'N/A',
        city: o.customer?.city || 'Lahore',
        address: o.customer?.address || '',
        productName: details.productName || (typeof o.notes === 'string' && !o.notes.startsWith('{') ? o.notes : 'Oversized Black Premium Hoodie'),
        variantInfo: details.variantInfo || 'Size: XL • Color: Black',
        quantity: details.quantity || 1,
      };
    });
  }

  async updateStatus(id: string, status: string, businessId: string) {
    const existing = await this.prisma.order.findFirst({
      where: { id, businessId },
    });
    if (!existing) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true },
    });

    if (status === 'DELIVERED' || status === 'CONFIRMED') {
      await this.prisma.paymentRecord.updateMany({
        where: { businessId, orderNumber: existing.orderNumber },
        data: {
          status: status === 'DELIVERED' ? 'PAID' : 'PENDING_VERIFICATION',
          notes: `Updated status to ${status} on ${new Date().toLocaleTimeString()}`,
        },
      }).catch(() => null);
    }

    if (status === 'RETURNED') {
      let details: any = {};
      if (existing.notes) {
        try { details = JSON.parse(existing.notes); } catch {}
      }

      const retNum = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
      await this.prisma.returnRequest.create({
        data: {
          businessId,
          returnNumber: retNum,
          orderNumber: existing.orderNumber,
          customerName: updatedOrder.customer?.fullName || 'Customer',
          customerPhone: updatedOrder.customer?.phoneNumber || 'N/A',
          productName: details.productName || 'Product Item',
          sku: 'SKU-RETURN',
          quantity: details.quantity || 1,
          returnReason: 'COD_REFUSED',
          status: 'RETURN_REQUESTED',
          restocked: false,
        },
      }).catch(() => null);
    }

    return updatedOrder;
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

    const notesPayload = JSON.stringify({
      productName: dto.productName || 'Oversized Black Premium Hoodie',
      variantInfo: dto.variantInfo || 'Size: XL • Color: Black',
      quantity: dto.quantity || 1,
      userNotes: dto.notes || '',
    });

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
        notes: notesPayload,
      },
      include: { customer: true },
    });

    await this.prisma.paymentRecord.create({
      data: {
        businessId: dto.businessId,
        orderNumber,
        customerName: customer.fullName,
        customerPhone: customer.phoneNumber,
        paymentMethod: dto.paymentMethod || 'COD',
        amountPKR: totalAmount,
        status: dto.paymentMethod === 'COD' ? 'PENDING_VERIFICATION' : 'PAID',
        date: new Date().toISOString(),
        notes: `Created for order ${orderNumber}`,
      },
    }).catch(() => null);

    return {
      ...createdOrder,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      city: customer.city,
      address: customer.address,
      productName: dto.productName || 'Oversized Black Premium Hoodie',
      variantInfo: dto.variantInfo || 'Size: XL • Color: Black',
      quantity: dto.quantity || 1,
    };
  }
}



