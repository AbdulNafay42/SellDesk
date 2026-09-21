import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ConversationsService, SendReplyDto } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async findAll(@Query('businessId') businessId?: string) {
    return this.conversationsService.findAll(businessId || 'biz-default');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('businessId') businessId?: string) {
    return this.conversationsService.findOne(id, businessId || 'biz-default');
  }

  @Post(':id/reply')
  async sendReply(
    @Param('id') conversationId: string,
    @Body('messageText') messageText: string,
  ) {
    return this.conversationsService.sendReply({ conversationId, messageText });
  }
}
