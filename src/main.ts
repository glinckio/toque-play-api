import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting ToquePlay API...');

    const app = await NestFactory.create(AppModule);

    // Configurar CORS para desenvolvimento e produção
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      // Desenvolvimento local
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // Produção
      'https://toqueplay.vercel.app',
      'https://toqueplay-frontend.vercel.app',
    ];

    app.enableCors({
      origin: (origin, callback) => {
        // Permitir requests sem origin (como mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Verificar se a origin está na lista de permitidas
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Em desenvolvimento, permitir todas as origens
        if (process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }

        console.log(`🚫 CORS blocked origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
      ],
    });

    // Configurar prefixo global da API
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`🌐 API available at: http://localhost:${port}/api`);
    console.log(`🔓 CORS enabled for origins:`, allowedOrigins);

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
