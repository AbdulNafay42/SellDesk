import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService, StockMovementDto } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  async getMovements(@Query('businessId') businessId?: string) {
    return this.inventoryService.getMovements(businessId || 'biz-default');
  }

  @Post('movements')
  async recordMovement(@Body() dto: StockMovementDto) {
    return this.inventoryService.recordMovement(dto);
  }
}
