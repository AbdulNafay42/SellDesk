import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CustomersService, CreateCustomerDto } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.customersService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.customersService.findOne(id, req.tenantId);
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    return this.customersService.create({
      ...createCustomerDto,
      businessId: req.tenantId, // Force verified tenant context
    });
  }
}

