import { Controller, Get, Post, Query, Body, ForbiddenException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const result = this.whatsappService.verifyWebhook(mode, token, challenge);
    if (result) return result;
    throw new ForbiddenException('Invalid verify token');
  }

  @Post('webhook')
  handleWebhook(@Body() payload: any) {
    return this.whatsappService.handleIncomingWebhook(payload);
  }
}
