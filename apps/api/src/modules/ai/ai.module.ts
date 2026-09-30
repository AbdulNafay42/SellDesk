import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProductsModule } from '../products/products.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ProductsModule, PrismaModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
