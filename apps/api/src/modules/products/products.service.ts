import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProductDto {
  businessId: string;
  name: string;
  description?: string;
  basePrice: number;
  sku?: string;
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

  // Mock in-memory product store for development when database is connecting/decoupled
  private mockProducts: any[] = [
    {
      id: 'prod-1',
      businessId: 'biz-default',
      name: 'Oversized Black Premium Hoodie',
      description: 'Heavyweight fleece cotton hoodie designed for street style.',
      basePrice: 4499,
      sku: 'HD-BLK-001',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [
        { id: 'v-1', size: 'S', color: 'Black', sku: 'HD-BLK-S', price: 4499, stock: 15 },
        { id: 'v-2', size: 'M', color: 'Black', sku: 'HD-BLK-M', price: 4499, stock: 24 },
        { id: 'v-3', size: 'L', color: 'Black', sku: 'HD-BLK-L', price: 4499, stock: 8 },
        { id: 'v-4', size: 'XL', color: 'Black', sku: 'HD-BLK-XL', price: 4499, stock: 3 },
      ],
    },
    {
      id: 'prod-2',
      businessId: 'biz-default',
      name: 'Vintage Wash Denim Jacket',
      description: 'Distressed vintage denim jacket with customized brass buttons.',
      basePrice: 6200,
      sku: 'JKT-VNT-002',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [
        { id: 'v-5', size: 'M', color: 'Blue Wash', sku: 'JKT-VNT-M', price: 6200, stock: 10 },
        { id: 'v-6', size: 'L', color: 'Blue Wash', sku: 'JKT-VNT-L', price: 6200, stock: 5 },
      ],
    },
    {
      id: 'prod-3',
      businessId: 'biz-default',
      name: 'Minimalist Essential White Tee',
      description: 'Combed organic cotton luxury daily T-shirt.',
      basePrice: 1999,
      sku: 'TS-WHT-003',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [
        { id: 'v-7', size: 'S', color: 'White', sku: 'TS-WHT-S', price: 1999, stock: 40 },
        { id: 'v-8', size: 'M', color: 'White', sku: 'TS-WHT-M', price: 1999, stock: 35 },
        { id: 'v-9', size: 'L', color: 'White', sku: 'TS-WHT-L', price: 1999, stock: 20 },
      ],
    },
  ];

  async findAll(businessId: string) {
    try {
      if (this.prisma && (this.prisma as any).product) {
        return await this.prisma.product.findMany({
          where: { businessId },
          include: { variants: true },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {
      // Fallback to mock data for initial UI render
    }
    return this.mockProducts;
  }

  async findOne(id: string, businessId: string) {
    try {
      if (this.prisma && (this.prisma as any).product) {
        const prod = await this.prisma.product.findFirst({
          where: { id, businessId },
          include: { variants: true },
        });
        if (prod) return prod;
      }
    } catch {}

    const found = this.mockProducts.find((p) => p.id === id);
    if (!found) throw new NotFoundException('Product not found');
    return found;
  }

  async create(dto: CreateProductDto) {
    try {
      if (this.prisma && (this.prisma as any).product) {
        return await this.prisma.product.create({
          data: {
            businessId: dto.businessId,
            name: dto.name,
            description: dto.description,
            basePrice: dto.basePrice,
            sku: dto.sku,
            variants: {
              create: dto.variants || [],
            },
          },
          include: { variants: true },
        });
      }
    } catch {}

    const newProd = {
      id: `prod-${Date.now()}`,
      businessId: dto.businessId || 'biz-default',
      name: dto.name,
      description: dto.description || '',
      basePrice: dto.basePrice,
      sku: dto.sku || `SKU-${Date.now()}`,
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80',
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: (dto.variants || []).map((v, i) => ({
        id: `v-${Date.now()}-${i}`,
        size: v.size || 'Free',
        color: v.color || 'Standard',
        sku: v.sku || `SKU-${Date.now()}-${i}`,
        price: v.price || dto.basePrice,
        stock: v.stock || 10,
      })),
    };
    this.mockProducts.unshift(newProd);
    return newProd;
  }
}
