import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AiService, ClassifyMessageDto, ExtractOrderDto, GenerateReplyDto } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('classify')
  async classify(@Body() dto: ClassifyMessageDto) {
    return this.aiService.classifyMessage(dto);
  }

  @Post('extract-order')
  async extractOrder(@Body() dto: ExtractOrderDto) {
    return this.aiService.extractOrder(dto);
  }

  @Post('generate-reply')
  async generateReply(@Body() dto: GenerateReplyDto, @Req() req: any) {
    return this.aiService.generateGuardrailedReply(dto, req.tenantId);
  }

  @Get('actions')
  async getPendingActions(@Req() req: any) {
    return this.aiService.getPendingActions(req.tenantId);
  }

  @Post('actions/:id/approve')
  async approveAction(@Param('id') id: string, @Req() req: any) {
    return this.aiService.approveAction(id, req.tenantId);
  }

  @Post('actions/:id/reject')
  async rejectAction(@Param('id') id: string, @Req() req: any) {
    return this.aiService.rejectAction(id, req.tenantId);
  }
}
