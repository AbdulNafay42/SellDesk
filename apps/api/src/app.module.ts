import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
