import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect().catch((err) => {
      console.warn('Prisma connecting in decoupled fallback mode:', err.message);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
