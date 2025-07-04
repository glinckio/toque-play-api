import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        firebase: !!process.env.FIREBASE_PROJECT_ID,
        mercadopago: process.env.MERCADOPAGO_ENABLED === 'true',
      },
    };
  }

  @Get('api/health')
  getApiHealth() {
    return this.getHealth();
  }
}
