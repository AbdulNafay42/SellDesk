import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ConversationsService, SendReplyDto } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.conversationsService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.conversationsService.findOne(id, req.tenantId);
  }

  @Post([':id/reply', ':id/messages'])
  async sendReply(
    @Param('id') conversationId: string,
    @Body() body: { messageText?: string; text?: string },
    @Req() req: any,
  ) {
    const text = body.messageText || body.text || '';
    return this.conversationsService.sendReply({ conversationId, messageText: text }, req.tenantId);
  }
}
