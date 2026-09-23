import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { SaveWhatsAppConfigDto } from './dto/save-whatsapp-config.dto';
import { MetaWebhookPayload } from './dto/whatsapp-webhook.dto';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  /**
   * Public Meta Webhook Verification Handshake
   * GET /api/whatsapp/webhook
   */
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

  /**
   * Public Incoming Meta Webhook Endpoint
   * POST /api/whatsapp/webhook
   */
  @Post('webhook')
  async handleWebhook(@Body() payload: MetaWebhookPayload) {
    this.logger.log(`Received WhatsApp Webhook Payload: ${JSON.stringify(payload)}`);

    // Extract phone_number_id if present in Meta payload
    const phoneNumberId = payload?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    if (phoneNumberId) {
      try {
        const tenantResolution = await this.whatsappService.resolveBusinessByPhoneNumberId(phoneNumberId);
        this.logger.log(`Resolved Webhook Tenant Context: Business ID ${tenantResolution.businessId} for phone_number_id ${phoneNumberId}`);
      } catch (err: any) {
        this.logger.warn(`Webhook Tenant Resolution Warning: ${err.message}`);
      }
    }

    return { status: 'RECEIVED' };
  }

  /**
   * Protected Tenant Endpoint: Save/Update WhatsApp Credentials
   * POST /api/whatsapp/config
   */
  @Post('config')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async saveConfig(@Req() req: any, @Body() dto: SaveWhatsAppConfigDto) {
    return this.whatsappService.saveTenantConfig(req.tenantId, dto);
  }

  /**
   * Protected Tenant Endpoint: Retrieve Active WhatsApp Credentials
   * GET /api/whatsapp/config
   */
  @Get('config')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getConfig(@Req() req: any) {
    return this.whatsappService.getTenantConfig(req.tenantId);
  }
}
