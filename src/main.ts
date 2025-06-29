import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting ToquePlay API...');

    const app = await NestFactory.create(AppModule);

    // Configurar CORS para produção
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://toqueplay.vercel.app',
      ],
      credentials: true,
    });

    // Configurar prefixo global da API
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`🌐 API available at: http://localhost:${port}/api`);

    // Log das configurações
    console.log('📋 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      MERCADOPAGO_ENABLED: process.env.MERCADOPAGO_ENABLED,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
        ? 'Configured'
        : 'Not configured',
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
