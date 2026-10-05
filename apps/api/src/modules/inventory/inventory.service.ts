import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getVariants(businessId: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { businessId },
      include: { product: true },
      orderBy: { stock: 'asc' },
    });

    return variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      productName: v.product?.name || 'Product',
      size: v.size || '',
      color: v.color || '',
      stock: v.stock,
      label: `${v.sku} (${v.product?.name || 'Product'} ${v.size || ''} ${v.color || ''} - ${v.stock} units left)`,
    }));
  }

  async getLowStockAlerts(businessId: string) {
    const lowVariants = await this.prisma.productVariant.findMany({
      where: { businessId },
      include: { product: true },
      orderBy: { stock: 'asc' },
    });

    if (lowVariants.length === 0) return null;

    // Pick lowest stock variant
    const lowest = lowVariants[0];
    return {
      sku: lowest.sku,
      productName: lowest.product?.name || 'Product',
      variantInfo: `${lowest.size || ''} ${lowest.color || ''}`.trim() || 'Standard',
      stock: lowest.stock,
      isAlertTriggered: lowest.stock <= 5,
    };
  }

  async getMovements(businessId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return movements.map((m) => {
      const diffMs = Date.now() - new Date(m.createdAt).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      let timestamp = 'Just now';
      if (diffMins >= 60) {
        const diffHours = Math.floor(diffMins / 60);
        timestamp = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffMins > 0) {
        timestamp = `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
      }

      return {
        ...m,
        timestamp,
      };
    });
  }

  async recordMovement(dto: StockMovementDto & { businessId: string }) {
    // 1. Find variant by SKU
    const variant = await this.prisma.productVariant.findFirst({
      where: { businessId: dto.businessId, sku: dto.sku },
      include: { product: true },
    });

    let previousStock = 0;
    let newStock = dto.quantity;
    let productName = 'Restocked Item';
    let variantInfo = 'Standard';

    if (variant) {
      previousStock = variant.stock;
      newStock = Math.max(0, previousStock + dto.quantity);
      productName = variant.product?.name || 'Restocked Item';
      variantInfo = `${variant.size || ''} ${variant.color || ''}`.trim() || 'Standard';

      // Update variant stock in DB
      await this.prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: newStock },
      });
    }

    // 2. Record movement
    const movement = await this.prisma.stockMovement.create({
      data: {
        businessId: dto.businessId,
        sku: dto.sku,
        productName,
        variantInfo,
        type: dto.type,
        quantity: dto.quantity,
        previousStock,
        newStock,
        reference: dto.notes || 'Manual Adjustment',
      },
    });

    return {
      ...movement,
      timestamp: 'Just now',
    };
  }
}

