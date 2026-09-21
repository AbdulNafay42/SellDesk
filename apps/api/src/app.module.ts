import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { ConversationsModule } from './modules/conversations/conversations.module';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    WhatsappModule,
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
