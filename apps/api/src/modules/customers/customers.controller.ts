import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CustomersService, CreateCustomerDto } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query('businessId') businessId?: string) {
    return this.customersService.findAll(businessId || 'biz-default');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('businessId') businessId?: string) {
    return this.customersService.findOne(id, businessId || 'biz-default');
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
}
