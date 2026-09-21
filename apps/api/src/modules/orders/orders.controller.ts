import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService, CreateOrderDto } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Req() req: any, @Query('status') status?: string) {
    return this.ordersService.findAll(req.tenantId, status);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create({
      ...createOrderDto,
      businessId: req.tenantId, // Force verified tenant context
    });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    return this.ordersService.updateStatus(id, status, req.tenantId);
  }
}

