import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'SellDesk Backend API Service',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      docs: '/api/products',
    };
  }
}
