import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { ReturnsService, ReturnRequest } from './returns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('returns')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  async findAll(@Req() req: any): Promise<ReturnRequest[]> {
    return this.returnsService.findAll(req.tenantId);
  }

  @Post(':id/restock')
  async restockReturn(@Param('id') id: string, @Req() req: any): Promise<ReturnRequest> {
    return this.returnsService.restockReturn(id, req.tenantId);
  }
}
