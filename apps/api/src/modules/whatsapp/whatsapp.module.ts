import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { MetaWhatsAppClient } from './meta-whatsapp.client';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, MetaWhatsAppClient],
  exports: [WhatsappService, MetaWhatsAppClient],
})
export class WhatsappModule {}
