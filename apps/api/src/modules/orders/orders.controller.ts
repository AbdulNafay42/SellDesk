import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Query('businessId') businessId?: string, @Query('status') status?: string) {
    return this.ordersService.findAll(businessId || 'biz-default', status);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Query('businessId') businessId?: string,
  ) {
    return this.ordersService.updateStatus(id, status, businessId || 'biz-default');
  }
}
