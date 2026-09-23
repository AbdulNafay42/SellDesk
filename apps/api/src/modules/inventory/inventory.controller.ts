import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { InventoryService, StockMovementDto } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  async getMovements(@Req() req: any) {
    return this.inventoryService.getMovements(req.tenantId);
  }

  @Post('movements')
  async recordMovement(@Body() dto: StockMovementDto, @Req() req: any) {
    return this.inventoryService.recordMovement({
      ...dto,
      businessId: req.tenantId,
    });
  }
}
