import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCustomerDto {
  businessId: string;
  fullName: string;
  phoneNumber: string;
  city?: string;
  address?: string;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}



  async findAll(businessId: string) {
    const rawCustomers = await this.prisma.customer.findMany({
      where: { businessId },
      include: { orders: true },
      orderBy: { createdAt: 'desc' },
    });

    return rawCustomers.map((c) => {
      const orders = c.orders || [];
      const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
      const returnedOrders = orders.filter(
        (o) => o.status === 'RETURNED' || o.status === 'CANCELLED'
      ).length;

      let lastOrdered = 'No orders yet';
      if (orders.length > 0) {
        const sorted = [...orders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastDate = new Date(sorted[0].createdAt);
        const diffMs = Date.now() - lastDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) lastOrdered = 'Just now';
        else if (diffHours < 24) lastOrdered = `${diffHours} hours ago`;
        else {
          const diffDays = Math.floor(diffHours / 24);
          lastOrdered = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
      }

      return {
        ...c,
        totalSpent,
        totalOrders,
        deliveredOrders,
        returnedOrders,
        lastOrdered,
      };
    });
  }

  async findOne(id: string, businessId: string) {
    const c = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: { orders: true },
    });
    if (!c) throw new NotFoundException('Customer not found');

    const orders = c.orders || [];
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
    const returnedOrders = orders.filter(
      (o) => o.status === 'RETURNED' || o.status === 'CANCELLED'
    ).length;

    let lastOrdered = 'No orders yet';
    if (orders.length > 0) {
      const sorted = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastDate = new Date(sorted[0].createdAt);
      const diffMs = Date.now() - lastDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) lastOrdered = 'Just now';
      else if (diffHours < 24) lastOrdered = `${diffHours} hours ago`;
      else {
        const diffDays = Math.floor(diffHours / 24);
        lastOrdered = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      }
    }

    return {
      ...c,
      totalSpent,
      totalOrders,
      deliveredOrders,
      returnedOrders,
      lastOrdered,
    };
  }

  async create(dto: CreateCustomerDto) {
    return await this.prisma.customer.create({
      data: {
        businessId: dto.businessId,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        city: dto.city,
        address: dto.address,
      },
    });
  }
}

