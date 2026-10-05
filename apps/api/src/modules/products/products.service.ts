import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProductDto {
  businessId: string;
  name: string;
  description?: string;
  basePrice?: number;
  pricePKR?: number;
  sku?: string;
  imageUrl?: string;
  variants?: {
    size?: string;
    color?: string;
    sku: string;
    price: number;
    stock: number;
  }[];
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return await this.prisma.product.findMany({
      where: { businessId },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, businessId: string) {
    const prod = await this.prisma.product.findFirst({
      where: { id, businessId },
      include: { variants: true },
    });
    if (!prod) throw new NotFoundException('Product not found');
    return prod;
  }

  async create(dto: CreateProductDto) {
    const basePrice = dto.basePrice !== undefined ? dto.basePrice : (dto.pricePKR !== undefined ? dto.pricePKR : 0);
    const baseSku = dto.sku && dto.sku.trim() ? dto.sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;

    // Ensure variant SKUs are unique per business to avoid Prisma P2002 unique constraint failures
    const preparedVariants = (dto.variants && dto.variants.length > 0 ? dto.variants : [
      { size: 'S', color: 'Standard', sku: `${baseSku}-S`, price: basePrice, stock: 10 },
      { size: 'M', color: 'Standard', sku: `${baseSku}-M`, price: basePrice, stock: 15 },
      { size: 'L', color: 'Standard', sku: `${baseSku}-L`, price: basePrice, stock: 12 },
    ]).map((v, idx) => {
      const cleanSize = (v.size || 'STD').trim().toUpperCase().replace(/\s+/g, '');
      const cleanColor = (v.color || 'VAR').trim().toUpperCase().replace(/\s+/g, '');
      const defaultVariantSku = `${baseSku}-${cleanSize}-${cleanColor}`;
      const uniqueSuffix = `-${Date.now().toString().slice(-4)}${idx}`;

      let variantSku = v.sku && v.sku.trim() && !['SKU-S', 'SKU-M', 'SKU-L'].includes(v.sku)
        ? v.sku.trim()
        : defaultVariantSku;

      return {
        size: v.size || 'Standard',
        color: v.color || 'Standard',
        sku: variantSku,
        price: v.price !== undefined ? v.price : basePrice,
        stock: v.stock !== undefined ? Number(v.stock) : 0,
        businessId: dto.businessId,
      };
    });

    // Check for SKU collisions and deduplicate if needed
    const usedSkus = new Set<string>();
    for (const varItem of preparedVariants) {
      if (usedSkus.has(varItem.sku)) {
        varItem.sku = `${varItem.sku}-${Math.floor(100 + Math.random() * 900)}`;
      }
      usedSkus.add(varItem.sku);
    }

    return await this.prisma.product.create({
      data: {
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description || '',
        basePrice,
        sku: baseSku,
        imageUrl: dto.imageUrl || null,
        variants: {
          create: preparedVariants,
        },
      },
      include: { variants: true },
    });
  }
}



