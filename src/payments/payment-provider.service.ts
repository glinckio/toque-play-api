import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';
import { MockPaymentService } from './mock-payment.service';

@Injectable()
export class PaymentProviderService {
  private readonly logger = new Logger(PaymentProviderService.name);
  private readonly isMercadoPagoEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly mockPaymentService: MockPaymentService,
  ) {
    this.isMercadoPagoEnabled =
      this.configService.get<boolean>('payment.mercadoPagoEnabled') ?? false;
    this.logger.log(
      `Payment Provider inicializado - Mercado Pago: ${this.isMercadoPagoEnabled ? 'ENABLED' : 'DISABLED'}`,
    );
  }

  async createPixPayment(data: {
    amount: number;
    description: string;
    orderId: string;
    payerEmail: string;
    payerFirstName: string;
    payerLastName: string;
    payerCpf: string;
  }) {
    if (this.isMercadoPagoEnabled) {
      this.logger.log('Usando Mercado Pago real para criar pagamento PIX');
      return this.mercadoPagoService.createPixPayment(data);
    } else {
      this.logger.log('Usando serviço mock para criar pagamento PIX');
      return this.mockPaymentService.createPixPayment(data);
    }
  }

  async getPaymentStatus(paymentId: number) {
    if (this.isMercadoPagoEnabled) {
      this.logger.log(
        `Consultando status do pagamento ${paymentId} no Mercado Pago`,
      );
      return this.mercadoPagoService.getPaymentStatus(paymentId);
    } else {
      this.logger.log(`Consultando status do pagamento ${paymentId} no mock`);
      return this.mockPaymentService.getPaymentStatus(paymentId);
    }
  }

  async handleWebhook(notification: any) {
    if (this.isMercadoPagoEnabled) {
      this.logger.log('Processando webhook do Mercado Pago real');
      return this.mercadoPagoService.handleWebhook(notification);
    } else {
      this.logger.log('Processando webhook mock');
      return this.mockPaymentService.handleWebhook(notification);
    }
  }

  // Métodos específicos do mock (só disponíveis quando Mercado Pago está desabilitado)
  async approveMockPayment(paymentId: number) {
    if (this.isMercadoPagoEnabled) {
      throw new Error('Aprovação manual só disponível em modo mock');
    }
    return this.mockPaymentService.approvePayment(paymentId);
  }

  getMockPayments() {
    if (this.isMercadoPagoEnabled) {
      throw new Error('Listagem de pagamentos mock só disponível em modo mock');
    }
    return this.mockPaymentService.getMockPayments();
  }

  isMockMode() {
    return !this.isMercadoPagoEnabled;
  }
}
