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

export interface CreateReturnDto {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  sku?: string;
  quantity?: number;
  returnReason: string;
}

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return await this.prisma.returnRequest.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateReturnDto & { businessId: string }) {
    const returnNumber = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
    return await this.prisma.returnRequest.create({
      data: {
        businessId: dto.businessId,
        returnNumber,
        orderNumber: dto.orderNumber,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        productName: dto.productName,
        sku: dto.sku || 'SKU-STANDARD',
        quantity: dto.quantity || 1,
        returnReason: dto.returnReason || 'SIZE_MISMATCH',
        status: 'RETURN_REQUESTED',
        restocked: false,
      },
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

    // Try to restock variant stock in Prisma if SKU exists
    if (ret.sku) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { businessId, sku: ret.sku },
      });
      if (variant) {
        const previousStock = variant.stock;
        const newStock = previousStock + (ret.quantity || 1);
        await this.prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: newStock },
        });

        await this.prisma.stockMovement.create({
          data: {
            businessId,
            sku: ret.sku,
            productName: ret.productName,
            variantInfo: `Return Restock (${ret.returnNumber})`,
            type: 'RETURN_RESTOCK',
            quantity: ret.quantity || 1,
            previousStock,
            newStock,
            reference: `Return Restock #${ret.returnNumber}`,
          },
        }).catch(() => null);
      }
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

