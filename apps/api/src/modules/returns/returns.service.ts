import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReturnRequest {
  id: string;
  businessId?: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  sku: string;
  quantity: number;
  returnReason: string;
  status: string;
  requestDate: any;
  restocked: boolean;
}

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return await this.prisma.returnRequest.findMany({
      where: { businessId },
      orderBy: { requestDate: 'desc' },
    });
  }

  async restockReturn(id: string, businessId: string) {
    const ret = await this.prisma.returnRequest.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!ret) {
      throw new NotFoundException(`Return request #${id} not found`);
    }

    return await this.prisma.returnRequest.update({
      where: { id: ret.id },
      data: {
        status: 'RESTOCKED',
        restocked: true,
      },
    });
  }
}

