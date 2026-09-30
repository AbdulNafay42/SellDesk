import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database (selldesk)');
    } catch (err) {
      this.logger.error('Failed to connect to PostgreSQL database:', err.message);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

