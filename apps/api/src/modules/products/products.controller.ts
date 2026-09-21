import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProductsService, CreateProductDto } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query('businessId') businessId?: string) {
    return this.productsService.findAll(businessId || 'biz-default');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('businessId') businessId?: string) {
    return this.productsService.findOne(id, businessId || 'biz-default');
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
