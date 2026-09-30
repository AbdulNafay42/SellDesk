import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StockMovementDto {
  variantId?: string;
  sku: string;
  type: 'INBOUND_RESTOCK' | 'OUTBOUND_ORDER' | 'RETURN_RESTOCK' | 'ADJUSTMENT';
  quantity: number;
  notes?: string;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getMovements(businessId: string) {
    return await this.prisma.stockMovement.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordMovement(dto: StockMovementDto & { businessId: string }) {
    return await this.prisma.stockMovement.create({
      data: {
        businessId: dto.businessId,
        sku: dto.sku,
        productName: 'Restocked Item',
        variantInfo: 'Standard',
        type: dto.type,
        quantity: dto.quantity,
        previousStock: 10,
        newStock: 10 + dto.quantity,
        reference: dto.notes || 'Manual Adjustment',
      },
    });
  }

}

