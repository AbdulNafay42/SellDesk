import { Injectable } from '@nestjs/common';

export interface StockMovementDto {
  variantId: string;
  sku: string;
  type: 'INBOUND_RESTOCK' | 'OUTBOUND_ORDER' | 'RETURN_RESTOCK' | 'ADJUSTMENT';
  quantity: number;
  notes?: string;
}

@Injectable()
export class InventoryService {
  private mockMovements = [
    {
      id: 'mov-1',
      businessId: 'biz-default',
      sku: 'HD-BLK-XL',
      productName: 'Oversized Black Premium Hoodie',
      variantInfo: 'Size: XL • Color: Black',
      type: 'OUTBOUND_ORDER',
      quantity: -2,
      previousStock: 5,
      newStock: 3,
      reference: 'Order #ORD-1042',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'mov-2',
      businessId: 'biz-default',
      sku: 'JKT-VNT-M',
      productName: 'Vintage Wash Denim Jacket',
      variantInfo: 'Size: M • Color: Blue Wash',
      type: 'INBOUND_RESTOCK',
      quantity: 10,
      previousStock: 0,
      newStock: 10,
      reference: 'Supplier Shipment #SS-489',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'mov-3',
      businessId: 'biz-default',
      sku: 'TS-WHT-S',
      productName: 'Minimalist Essential White Tee',
      variantInfo: 'Size: S • Color: White',
      type: 'OUTBOUND_ORDER',
      quantity: -1,
      previousStock: 41,
      newStock: 40,
      reference: 'Order #ORD-1038',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  async getMovements(businessId: string) {
    return this.mockMovements.filter((m) => m.businessId === businessId);
  }

  async recordMovement(dto: StockMovementDto & { businessId?: string }) {
    const newMovement = {
      id: `mov-${Date.now()}`,
      businessId: dto.businessId || 'biz-default',
      sku: dto.sku,
      productName: 'Restocked Clothing Item',
      variantInfo: 'Size: Standard',
      type: dto.type,
      quantity: dto.quantity,
      previousStock: 10,
      newStock: 10 + dto.quantity,
      reference: dto.notes || 'Manual Adjustment',
      timestamp: new Date().toISOString(),
    };
    this.mockMovements.unshift(newMovement);
    return newMovement;
  }
}
