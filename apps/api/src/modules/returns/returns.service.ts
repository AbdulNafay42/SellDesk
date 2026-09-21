import { Injectable, NotFoundException } from '@nestjs/common';

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  sku: string;
  quantity: number;
  returnReason: 'SIZE_MISMATCH' | 'WRONG_ITEM_SENT' | 'DEFECTIVE' | 'COD_REFUSED';
  status: 'RETURN_REQUESTED' | 'APPROVED' | 'RECEIVED_IN_WAREHOUSE' | 'RESTOCKED' | 'REFUNDED';
  requestDate: string;
  restocked: boolean;
}

@Injectable()
export class ReturnsService {
  private returns: ReturnRequest[] = [
    {
      id: 'ret-101',
      returnNumber: 'RET-8801',
      orderNumber: 'ORD-1077',
      customerName: 'Zubair Raza',
      customerPhone: '0333-2211443',
      productName: 'Oversized Black Premium Hoodie (L)',
      sku: 'HOOD-BLK-L',
      quantity: 1,
      returnReason: 'SIZE_MISMATCH',
      status: 'RECEIVED_IN_WAREHOUSE',
      requestDate: '2026-09-19 11:20',
      restocked: false,
    },
    {
      id: 'ret-102',
      returnNumber: 'RET-8802',
      orderNumber: 'ORD-1065',
      customerName: 'Kashif Ali',
      customerPhone: '0321-9988776',
      productName: 'Vintage Wash Denim Jacket (M)',
      sku: 'JCKT-DEN-M',
      quantity: 1,
      returnReason: 'COD_REFUSED',
      status: 'RESTOCKED',
      requestDate: '2026-09-18 16:40',
      restocked: true,
    },
    {
      id: 'ret-103',
      returnNumber: 'RET-8803',
      orderNumber: 'ORD-1085',
      customerName: 'Mariam Sohail',
      customerPhone: '0315-4433221',
      productName: 'Minimalist Essential White Tee (S)',
      sku: 'TEE-WHT-S',
      quantity: 2,
      returnReason: 'WRONG_ITEM_SENT',
      status: 'RETURN_REQUESTED',
      requestDate: '2026-09-21 15:30',
      restocked: false,
    },
  ];

  findAll(): ReturnRequest[] {
    return this.returns;
  }

  restockReturn(id: string): ReturnRequest {
    const ret = this.returns.find((r) => r.id === id);
    if (!ret) {
      throw new NotFoundException(`Return request #${id} not found`);
    }
    ret.status = 'RESTOCKED';
    ret.restocked = true;
    return ret;
  }
}
