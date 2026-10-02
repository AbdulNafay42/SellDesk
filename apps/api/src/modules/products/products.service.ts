import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProductDto {
  businessId: string;
  name: string;
  description?: string;
  basePrice?: number;
  pricePKR?: number;
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
    return await this.prisma.product.create({
      data: {
        businessId: dto.businessId,
        name: dto.name,
        description: dto.description,
        basePrice,
        sku: dto.sku,
        variants: {
          create: (dto.variants || []).map((v) => ({
            ...v,
            businessId: dto.businessId,
          })),
        },
      },
      include: { variants: true },
    });
  }
}


