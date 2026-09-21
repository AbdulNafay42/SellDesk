import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ShippingService, Consignment } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  findAll(): Consignment[] {
    return this.shippingService.findAll();
  }

  @Get(':cnNumber')
  findByCn(@Param('cnNumber') cnNumber: string): Consignment {
    return this.shippingService.findByCn(cnNumber);
  }

  @Post('book')
  bookConsignment(
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
  ): Consignment {
    return this.shippingService.bookConsignment(body);
  }
}
