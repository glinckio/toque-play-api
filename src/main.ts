import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting ToquePlay API...');

    const app = await NestFactory.create(AppModule);

    // Middleware global para liberar OPTIONS antes dos guards
    app.use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header(
          'Access-Control-Allow-Methods',
          'GET,POST,PUT,DELETE,PATCH,OPTIONS',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma',
        );
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.sendStatus(204);
      }
      next();
    });

    // Configurar CORS para desenvolvimento e produção
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'https://toqueplay.vercel.app',
      'https://toqueplay-frontend.vercel.app',
    ];

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
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
