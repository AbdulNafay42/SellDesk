import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ProductsService, CreateProductDto } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.productsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.productsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productsService.create({
      ...createProductDto,
      businessId: req.tenantId, // Force verified tenant context
    });
  }
}

