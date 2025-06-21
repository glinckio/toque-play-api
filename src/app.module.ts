import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { PaymentsModule } from './payments/payments.module';
import mercadopagoConfig from './config/mercadopago.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mercadopagoConfig],
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    TournamentsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
