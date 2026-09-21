import { Controller, Get, Post, Param } from '@nestjs/common';
import { ReturnsService, ReturnRequest } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll(): ReturnRequest[] {
    return this.returnsService.findAll();
  }

  @Post(':id/restock')
  restockReturn(@Param('id') id: string): ReturnRequest {
    return this.returnsService.restockReturn(id);
  }
}
