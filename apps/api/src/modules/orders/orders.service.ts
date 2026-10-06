import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateOrderDto {
  businessId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  productName: string;
  variantInfo?: string;
  quantity?: number;
  totalAmount?: number;
  paymentMethod?: string;
  notes?: string;
  productId?: string;
  variantId?: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string, status?: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        businessId,
        ...(status && status !== 'ALL' ? { status: status as any } : {}),
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o: any) => {
      let details: any = {};
      if (o.notes) {
        try {
          details = JSON.parse(o.notes);
        } catch {
          details = {};
        }
      }

      return {
        ...o,
        customerName: o.customer?.fullName || 'Walk-in Customer',
        customerPhone: o.customer?.phoneNumber || 'N/A',
        city: o.customer?.city || 'Lahore',
        address: o.customer?.address || '',
        productName: details.productName || (typeof o.notes === 'string' && !o.notes.startsWith('{') ? o.notes : 'Order Item'),
        variantInfo: details.variantInfo || 'Standard',
        quantity: details.quantity || 1,
      };
    });
  }

  async updateStatus(id: string, status: string, businessId: string) {
    const existing = await this.prisma.order.findFirst({
      where: { id, businessId },
    });
    if (!existing) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true },
    });

    if (status === 'DELIVERED' || status === 'CONFIRMED') {
      await this.prisma.paymentRecord.updateMany({
        where: { businessId, orderNumber: existing.orderNumber },
        data: {
          status: status === 'DELIVERED' ? 'PAID' : 'PENDING_VERIFICATION',
          notes: `Updated status to ${status} on ${new Date().toLocaleTimeString()}`,
        },
      }).catch(() => null);
    }

    if (status === 'RETURNED') {
      let details: any = {};
      if (existing.notes) {
        try { details = JSON.parse(existing.notes); } catch {}
      }

      const retNum = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
      await this.prisma.returnRequest.create({
        data: {
          businessId,
          returnNumber: retNum,
          orderNumber: existing.orderNumber,
          customerName: updatedOrder.customer?.fullName || 'Customer',
          customerPhone: updatedOrder.customer?.phoneNumber || 'N/A',
          productName: details.productName || 'Product Item',
          sku: 'SKU-RETURN',
          quantity: details.quantity || 1,
          returnReason: 'COD_REFUSED',
          status: 'RETURN_REQUESTED',
          restocked: false,
        },
      }).catch(() => null);
    }

    return updatedOrder;
  }

  async create(dto: CreateOrderDto) {
    // Validate productId tenant ownership if provided
    let verifiedProduct: any = null;
    if (dto.productId) {
      verifiedProduct = await this.prisma.product.findFirst({
        where: { id: dto.productId },
      });
      if (!verifiedProduct || verifiedProduct.businessId !== dto.businessId) {
        throw new BadRequestException(`Product ${dto.productId} does not belong to business ${dto.businessId}`);
      }
    }

    // Validate variantId tenant ownership if provided
    let verifiedVariant: any = null;
    if (dto.variantId) {
      verifiedVariant = await this.prisma.productVariant.findFirst({
        where: { id: dto.variantId },
        include: { product: true },
      });
      if (!verifiedVariant || verifiedVariant.businessId !== dto.businessId || verifiedVariant.product?.businessId !== dto.businessId) {
        throw new BadRequestException(`Variant ${dto.variantId} does not belong to business ${dto.businessId}`);
      }
    }

    let customer = await this.prisma.customer.findFirst({
      where: { businessId: dto.businessId, phoneNumber: dto.customerPhone || '03000000000' },
    });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          businessId: dto.businessId,
          fullName: dto.customerName || 'Walk-in Customer',
          phoneNumber: dto.customerPhone || '03000000000',
          city: dto.city || 'Lahore',
          address: dto.address || '',
        },
      });
    }

    const shippingFee = 250;
    const subtotal = dto.totalAmount || (verifiedVariant ? verifiedVariant.price : (verifiedProduct ? verifiedProduct.basePrice : 0));
    const totalAmount = subtotal + shippingFee;
    const orderNumber = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalProductName = dto.productName || (verifiedProduct ? verifiedProduct.name : 'Catalog Item');
    const finalVariantInfo = dto.variantInfo || (verifiedVariant ? `Size: ${verifiedVariant.size || 'STD'} • Color: ${verifiedVariant.color || 'STD'}` : 'Standard');

    const notesPayload = JSON.stringify({
      productName: finalProductName,
      variantInfo: finalVariantInfo,
      quantity: dto.quantity || 1,
      userNotes: dto.notes || '',
      productId: verifiedProduct?.id || null,
      variantId: verifiedVariant?.id || null,
    });

    const createdOrder = await this.prisma.order.create({
      data: {
        businessId: dto.businessId,
        customerId: customer.id,
        orderNumber,
        status: 'NEW',
        paymentStatus: 'PENDING',
        paymentMethod: dto.paymentMethod || 'COD',
        subtotal,
        shippingFee,
        totalAmount,
        notes: notesPayload,
      },
      include: { customer: true },
    });

    await this.prisma.paymentRecord.create({
      data: {
        businessId: dto.businessId,
        orderNumber,
        customerName: customer.fullName,
        customerPhone: customer.phoneNumber,
        paymentMethod: dto.paymentMethod || 'COD',
        amountPKR: totalAmount,
        status: dto.paymentMethod === 'COD' ? 'PENDING_VERIFICATION' : 'PAID',
        date: new Date().toISOString(),
        notes: `Created for order ${orderNumber}`,
      },
    }).catch(() => null);

    return {
      ...createdOrder,
      customerName: customer.fullName,
      customerPhone: customer.phoneNumber,
      city: customer.city,
      address: customer.address,
      productName: finalProductName,
      variantInfo: finalVariantInfo,
      quantity: dto.quantity || 1,
    };
  }
}
