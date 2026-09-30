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
    return await this.prisma.customer.findMany({
      where: { businessId },
      include: { orders: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, businessId: string) {
    const cust = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: { orders: true },
    });
    if (!cust) throw new NotFoundException('Customer not found');
    return cust;
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

