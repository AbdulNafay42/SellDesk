import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [PrismaModule, ProductsModule, CustomersModule, OrdersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
