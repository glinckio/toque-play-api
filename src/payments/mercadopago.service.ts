import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MP_ACCESS_TOKEN não configurado');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
    });
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
    try {
      const paymentData = {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payerEmail,
          first_name: data.payerFirstName,
          last_name: data.payerLastName,
          identification: {
            type: 'CPF',
            number: data.payerCpf,
          },
        },
      };

      const payment = await new Payment(this.client).create({
        body: paymentData,
      });

      return {
        id: payment.id,
        status: payment.status,
        qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          payment.point_of_interaction?.transaction_data?.qr_code_base64,
        payment,
      };
    } catch (error) {
      this.logger.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: number) {
    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('MP_ACCESS_TOKEN')}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar pagamento: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }

  async handleWebhook(notification: any) {
    if (notification.type === 'payment' && notification.data?.id) {
      const paymentId = notification.data.id;

      try {
        const payment = await this.getPaymentStatus(paymentId);

        this.logger.log(
          `Webhook recebido - Payment ID: ${paymentId}, Status: ${payment.status}, Status Detail: ${payment.status_detail}`,
        );

        return {
          paymentId,
          status: payment.status,
          statusDetail: payment.status_detail,
          payment,
        };
      } catch (error) {
        this.logger.error('Erro ao processar webhook:', error);
        throw error;
      }
    }

    return null;
  }
}
