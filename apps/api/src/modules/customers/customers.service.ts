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

  private mockCustomers: any[] = [
    {
      id: 'cust-1',
      businessId: 'biz-default',
      fullName: 'Ahmed Khan',
      phoneNumber: '0300-4829102',
      city: 'Lahore',
      address: 'House #42, Block C, Model Town',
      totalSpent: 24500,
      totalOrders: 7,
      deliveredOrders: 5,
      returnedOrders: 1,
      createdAt: new Date('2026-08-10'),
    },
    {
      id: 'cust-2',
      businessId: 'biz-default',
      fullName: 'Fatima Zohra',
      phoneNumber: '0321-9920144',
      city: 'Karachi',
      address: 'Flat 402, Sunset Boulevard, DHA Phase 5',
      totalSpent: 18600,
      totalOrders: 4,
      deliveredOrders: 4,
      returnedOrders: 0,
      createdAt: new Date('2026-08-15'),
    },
    {
      id: 'cust-3',
      businessId: 'biz-default',
      fullName: 'Usman Ali',
      phoneNumber: '0333-1029384',
      city: 'Islamabad',
      address: 'Street 14, Sector F-8/3',
      totalSpent: 8900,
      totalOrders: 2,
      deliveredOrders: 2,
      returnedOrders: 0,
      createdAt: new Date('2026-09-01'),
    },
    {
      id: 'cust-4',
      businessId: 'biz-default',
      fullName: 'Zainab Bibi',
      phoneNumber: '0345-5544332',
      city: 'Faisalabad',
      address: 'Civil Lines Road, Near Clock Tower',
      totalSpent: 14200,
      totalOrders: 3,
      deliveredOrders: 2,
      returnedOrders: 1,
      createdAt: new Date('2026-09-05'),
    },
    {
      id: 'cust-102-1',
      businessId: 'biz-102',
      fullName: 'Sadaf Kanwal',
      phoneNumber: '0301-8877665',
      city: 'Karachi',
      address: 'Clifton Block 2',
      totalSpent: 11980,
      totalOrders: 2,
      deliveredOrders: 2,
      returnedOrders: 0,
      createdAt: new Date('2026-09-10'),
    },
  ];

  async findAll(businessId: string) {
    try {
      if (this.prisma && (this.prisma as any).customer) {
        return await this.prisma.customer.findMany({
          where: { businessId },
          include: { orders: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {}
    return this.mockCustomers.filter((c) => c.businessId === businessId);
  }

  async findOne(id: string, businessId: string) {
    try {
      if (this.prisma && (this.prisma as any).customer) {
        const cust = await this.prisma.customer.findFirst({
          where: { id, businessId },
          include: { orders: true },
        });
        if (cust) return cust;
      }
    } catch {}

    const found = this.mockCustomers.find((c) => c.id === id && c.businessId === businessId);
    if (!found) throw new NotFoundException('Customer not found');
    return found;
  }

  async create(dto: CreateCustomerDto) {
    try {
      if (this.prisma && (this.prisma as any).customer) {
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
    } catch {}

    const newCust = {
      id: `cust-${Date.now()}`,
      businessId: dto.businessId || 'biz-default',
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      city: dto.city || 'Lahore',
      address: dto.address || '',
      totalSpent: 0,
      totalOrders: 0,
      deliveredOrders: 0,
      returnedOrders: 0,
      createdAt: new Date(),
    };
    this.mockCustomers.unshift(newCust);
    return newCust;
  }
}
