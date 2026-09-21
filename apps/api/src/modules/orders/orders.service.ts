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

  private mockOrders: any[] = [
    {
      id: 'ord-1042',
      orderNumber: '#ORD-1042',
      businessId: 'biz-default',
      customerName: 'Ahmed Khan',
      customerPhone: '0300-4829102',
      city: 'Lahore',
      address: 'House #42, Block C, Model Town',
      productName: 'Oversized Black Premium Hoodie',
      variantInfo: 'Size: XL • Color: Black',
      quantity: 1,
      subtotal: 4499,
      shippingFee: 250,
      totalAmount: 4749,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'NEW',
      createdAt: new Date(),
    },
    {
      id: 'ord-1041',
      orderNumber: '#ORD-1041',
      businessId: 'biz-default',
      customerName: 'Fatima Zohra',
      customerPhone: '0321-9920144',
      city: 'Karachi',
      address: 'Flat 402, Sunset Boulevard, DHA Phase 5',
      productName: 'Vintage Wash Denim Jacket',
      variantInfo: 'Size: M • Color: Blue Wash',
      quantity: 1,
      subtotal: 6200,
      shippingFee: 0,
      totalAmount: 6200,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      id: 'ord-1040',
      orderNumber: '#ORD-1040',
      businessId: 'biz-default',
      customerName: 'Usman Ali',
      customerPhone: '0333-1029384',
      city: 'Islamabad',
      address: 'Street 14, Sector F-8/3',
      productName: 'Minimalist Essential White Tee',
      variantInfo: 'Size: L • Color: White',
      quantity: 2,
      subtotal: 3998,
      shippingFee: 200,
      totalAmount: 4198,
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'PAID',
      status: 'PACKED',
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
    {
      id: 'ord-1039',
      orderNumber: '#ORD-1039',
      businessId: 'biz-default',
      customerName: 'Zainab Bibi',
      customerPhone: '0345-5544332',
      city: 'Faisalabad',
      address: 'Civil Lines Road',
      productName: 'Oversized Black Premium Hoodie',
      variantInfo: 'Size: M • Color: Black',
      quantity: 1,
      subtotal: 4499,
      shippingFee: 250,
      totalAmount: 4749,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 3600000 * 48),
    },
    {
      id: 'ord-2001',
      orderNumber: '#ORD-2001',
      businessId: 'biz-102',
      customerName: 'Sadaf Kanwal',
      customerPhone: '0301-8877665',
      city: 'Karachi',
      address: 'Clifton Block 2',
      productName: 'Khaadi Silk Lawn Kurti - Spring Edition',
      variantInfo: 'Size: M • Color: Maroon',
      quantity: 1,
      subtotal: 5990,
      shippingFee: 250,
      totalAmount: 6240,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      status: 'DELIVERED',
      createdAt: new Date(),
    },
  ];

  async findAll(businessId: string, status?: string) {
    try {
      if (this.prisma && (this.prisma as any).order) {
        return await this.prisma.order.findMany({
          where: {
            businessId,
            ...(status && status !== 'ALL' ? { status: status as any } : {}),
          },
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {}

    let filtered = this.mockOrders.filter((o) => o.businessId === businessId);
    if (status && status !== 'ALL') {
      filtered = filtered.filter((o) => o.status === status);
    }
    return filtered;
  }

  async updateStatus(id: string, status: string, businessId: string) {
    try {
      if (this.prisma && (this.prisma as any).order) {
        const existing = await this.prisma.order.findFirst({
          where: { id, businessId },
        });
        if (!existing) throw new NotFoundException('Order not found');

        return await this.prisma.order.update({
          where: { id },
          data: { status: status as any },
        });
      }
    } catch {}

    const order = this.mockOrders.find((o) => o.id === id && o.businessId === businessId);
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return order;
  }

  async create(dto: CreateOrderDto) {
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      businessId: dto.businessId || 'biz-default',
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      city: dto.city || 'Lahore',
      address: dto.address || '',
      productName: dto.productName,
      variantInfo: dto.variantInfo || 'Standard',
      quantity: dto.quantity || 1,
      subtotal: dto.totalAmount,
      shippingFee: 250,
      totalAmount: dto.totalAmount + 250,
      paymentMethod: dto.paymentMethod || 'COD',
      paymentStatus: 'PENDING',
      status: 'NEW',
      createdAt: new Date(),
    };
    this.mockOrders.unshift(newOrder);
    return newOrder;
  }
}
