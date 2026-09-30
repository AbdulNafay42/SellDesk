import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Consignment {
  id: string;
  businessId?: string;
  cnNumber: string;
  courier: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  destinationCity: string;
  address: string;
  codAmountPKR: number;
  weightKg: number;
  pieces: number;
  status: string;
  bookingDate: any;
  trackingHistory?: any;
}

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return await this.prisma.consignment.findMany({
      where: { businessId },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async findByCn(cnNumber: string, businessId?: string) {
    const consignment = await this.prisma.consignment.findFirst({
      where: {
        cnNumber,
        ...(businessId ? { businessId } : {}),
      },
    });

    if (!consignment) {
      throw new NotFoundException(`Consignment CN# ${cnNumber} not found`);
    }
    return consignment;
  }

  async bookConsignment(
    dto: {
      courier: 'TRAX' | 'LEOPARD' | 'CALLCOURIER' | 'TCS';
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      destinationCity: string;
      address: string;
      codAmountPKR: number;
      weightKg?: number;
      pieces?: number;
    },
    businessId: string,
  ) {
    const prefix = dto.courier === 'TRAX' ? 'TRX' : dto.courier === 'LEOPARD' ? 'LCS' : 'CC';
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    const newCn = `${prefix}-${randomNum}`;

    const initialHistory = [
      {
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        location: `${dto.courier} Origin Hub`,
        status: 'BOOKED',
        remarks: 'Consignment registered via SellDesk API',
      },
    ];

    return await this.prisma.consignment.create({
      data: {
        businessId,
        cnNumber: newCn,
        courier: dto.courier,
        orderNumber: dto.orderNumber,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        destinationCity: dto.destinationCity,
        address: dto.address,
        codAmountPKR: dto.codAmountPKR,
        weightKg: dto.weightKg || 0.5,
        pieces: dto.pieces || 1,
        status: 'BOOKED',
        remarks: 'Consignment registered via SellDesk API',
      },
    });
  }
}

