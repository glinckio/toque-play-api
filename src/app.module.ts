import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { PaymentsModule } from './payments/payments.module';
import paymentConfig from './config/payment.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [paymentConfig],
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
