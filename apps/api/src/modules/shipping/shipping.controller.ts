import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ShippingService, Consignment } from './shipping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('shipping')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  async findAll(@Req() req: any): Promise<Consignment[]> {
    return this.shippingService.findAll(req.tenantId);
  }

  @Get(':cnNumber')
  async findByCn(@Param('cnNumber') cnNumber: string, @Req() req: any): Promise<Consignment> {
    return this.shippingService.findByCn(cnNumber, req.tenantId);
  }

  @Post('book')
  async bookConsignment(
    @Body()
    body: {
      courier: 'TRAX' | 'LEOPARD' | 'CALLCOURIER' | 'TCS';
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      destinationCity: string;
      address: string;
      codAmountPKR: number;
      weightKg?: number;
      pieces?: number;
    },
    @Req() req: any,
  ): Promise<Consignment> {
    return this.shippingService.bookConsignment(body, req.tenantId);
  }
}
