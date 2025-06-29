import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from './mercadopago.service';
import { MockPaymentService } from './mock-payment.service';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentsController } from './payments.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import paymentConfig from '../config/payment.config';

@Module({
  imports: [FirebaseModule, ConfigModule.forFeature(paymentConfig)],
  providers: [
    PaymentsService,
    MercadoPagoService,
    MockPaymentService,
    PaymentProviderService,
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
