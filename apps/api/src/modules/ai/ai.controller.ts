import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AiService, ClassifyMessageDto, ExtractOrderDto, GenerateReplyDto } from './ai.service';

@Controller('ai')
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
  async generateReply(@Body() dto: GenerateReplyDto) {
    return this.aiService.generateGuardrailedReply(dto);
  }

  @Get('actions')
  async getPendingActions() {
    return this.aiService.getPendingActions();
  }

  @Post('actions/:id/approve')
  async approveAction(@Param('id') id: string) {
    return this.aiService.approveAction(id);
  }

  @Post('actions/:id/reject')
  async rejectAction(@Param('id') id: string) {
    return this.aiService.rejectAction(id);
  }
}
