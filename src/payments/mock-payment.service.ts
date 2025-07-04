import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class MockPaymentService {
  private readonly logger = new Logger(MockPaymentService.name);
  private mockPayments = new Map<number, any>();

  constructor(private readonly firebaseService: FirebaseService) {}

  async createPixPayment(data: {
    amount: number;
    description: string;
    orderId: string;
    payerEmail: string;
    payerFirstName: string;
    payerLastName: string;
    payerCpf: string;
  }) {
    const paymentId = Math.floor(Math.random() * 1000000) + 100000;

    // Simula um QR Code PIX
    const mockQrCode = `00020126580014br.gov.bcb.pix0136${uuidv4().replace(/-/g, '')}5204000053039865405100.005802BR5913Mock Payment6008Brasilia62070503***6304${this.generateCRC16('00020126580014br.gov.bcb.pix0136' + uuidv4().replace(/-/g, '') + '5204000053039865405100.005802BR5913Mock Payment6008Brasilia62070503***')}`;

    const mockPayment = {
      id: paymentId,
      status: 'pending',
      point_of_interaction: {
        transaction_data: {
          qr_code: mockQrCode,
          qr_code_base64:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        },
      },
      payer: {
        email: data.payerEmail,
        first_name: data.payerFirstName,
        last_name: data.payerLastName,
        identification: {
          type: 'CPF',
          number: data.payerCpf,
        },
      },
      transaction_amount: data.amount,
      description: data.description,
    };

    // Salva o pagamento mock para consulta posterior
    this.mockPayments.set(paymentId, {
      ...mockPayment,
      orderId: data.orderId,
      createdAt: new Date(),
    });

    this.logger.log(
      `Pagamento mock criado - ID: ${paymentId}, Order: ${data.orderId}`,
    );

    return {
      id: paymentId,
      status: 'pending',
      qr_code: mockQrCode,
      qr_code_base64:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      payment: mockPayment,
    };
  }

  async getPaymentStatus(paymentId: number) {
    const payment = this.mockPayments.get(paymentId);

    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    // Simula mudança de status após um tempo
    const timeSinceCreation = Date.now() - payment.createdAt.getTime();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos

    let status = 'pending';
    if (timeSinceCreation > fiveMinutes) {
      status = 'approved';
      // Atualiza o status no mock
      this.mockPayments.set(paymentId, { ...payment, status });
    }

    return {
      id: paymentId,
      status,
      status_detail:
        status === 'approved' ? 'accredited' : 'pending_waiting_payment',
      payer: payment.payer,
      transaction_amount: payment.transaction_amount,
      description: payment.description,
    };
  }

  async handleWebhook(notification: any) {
    // Simula webhook do Mercado Pago
    if (notification.type === 'payment' && notification.data?.id) {
      const paymentId = notification.data.id;
      const payment = await this.getPaymentStatus(paymentId);

      this.logger.log(
        `Webhook mock recebido - Payment ID: ${paymentId}, Status: ${payment.status}`,
      );

      return {
        paymentId,
        status: payment.status,
        statusDetail: payment.status_detail,
        payment,
      };
    }

    return null;
  }

  // Método para simular aprovação manual de pagamento (útil para testes)
  async approvePayment(paymentId: number) {
    this.logger.log(
      `Tentando aprovar pagamento mock - ID: ${paymentId}, tipo: ${typeof paymentId}`,
    );
    this.logger.log(
      `Pagamentos mock disponíveis: ${Array.from(this.mockPayments.keys()).join(', ')}`,
    );

    let payment = this.mockPayments.get(paymentId);

    // Se não encontrar em memória, busca no Firebase
    if (!payment) {
      this.logger.log(
        `Pagamento não encontrado em memória, buscando no Firebase - ID: ${paymentId}`,
      );
      try {
        const paymentDoc = await this.firebaseService.firestore
          .collection('payments')
          .doc(paymentId.toString())
          .get();

        if (!paymentDoc.exists) {
          this.logger.error(
            `Pagamento não encontrado no Firebase - ID: ${paymentId}`,
          );
          throw new Error('Pagamento não encontrado');
        }

        const firebaseData = paymentDoc.data();
        if (!firebaseData) {
          throw new Error('Dados do pagamento não encontrados no Firebase');
        }

        payment = {
          id: paymentId,
          status: firebaseData.status,
          payer: {
            email: firebaseData.payerEmail,
            first_name: firebaseData.payerName?.split(' ')[0] || '',
            last_name:
              firebaseData.payerName?.split(' ').slice(1).join(' ') || '',
            identification: {
              type: 'CPF',
              number: firebaseData.payerCpf,
            },
          },
          transaction_amount: firebaseData.amount,
          description: firebaseData.description,
          orderId: firebaseData.orderId,
          createdAt: firebaseData.createdAt?.toDate() || new Date(),
        };

        // Adiciona à memória para futuras consultas
        this.mockPayments.set(paymentId, payment);
        this.logger.log(
          `Pagamento carregado do Firebase e adicionado à memória - ID: ${paymentId}`,
        );
      } catch (error) {
        this.logger.error(
          `Erro ao buscar pagamento no Firebase - ID: ${paymentId}`,
          error,
        );
        throw new Error('Pagamento não encontrado');
      }
    }

    const updatedPayment = {
      ...payment,
      status: 'approved',
      status_detail: 'accredited',
      updatedAt: new Date(),
    };
    this.mockPayments.set(paymentId, updatedPayment);

    this.logger.log(`Pagamento mock aprovado manualmente - ID: ${paymentId}`);

    return updatedPayment;
  }

  // Método para listar pagamentos mock
  getMockPayments() {
    return Array.from(this.mockPayments.values());
  }

  // Gera CRC16 para simular QR Code válido
  private generateCRC16(str: string): string {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
      }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }
}
