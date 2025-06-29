import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentProviderService } from './payment-provider.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import {
  Firestore,
  Query,
  CollectionReference,
} from 'firebase-admin/firestore';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly firestore: Firestore;

  constructor(
    private readonly paymentProviderService: PaymentProviderService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.firestore = this.firebaseService.firestore;
  }

  // Cria um pagamento PIX usando o provider configurado
  async createPixPayment(createPixPaymentDto: CreatePixPaymentDto) {
    try {
      const payment =
        await this.paymentProviderService.createPixPayment(createPixPaymentDto);

      if (!payment.id) {
        throw new BadRequestException('ID do pagamento não foi retornado');
      }

      // Salva o pagamento no Firestore
      await this.firestore
        .collection('payments')
        .doc(payment.id.toString())
        .set({
          paymentId: payment.id,
          orderId: createPixPaymentDto.orderId,
          status: payment.status,
          amount: createPixPaymentDto.amount,
          description: createPixPaymentDto.description,
          payerEmail: createPixPaymentDto.payerEmail,
          payerName: `${createPixPaymentDto.payerFirstName} ${createPixPaymentDto.payerLastName}`,
          payerCpf: createPixPaymentDto.payerCpf,
          createdAt: new Date(),
          updatedAt: new Date(),
          isMock: this.paymentProviderService.isMockMode(),
        });

      return payment;
    } catch (error) {
      this.logger.error('Erro ao criar pagamento PIX:', error);
      throw new BadRequestException('Erro ao criar pagamento PIX');
    }
  }

  // Busca o status de um pagamento
  async getPaymentStatus(paymentId: number) {
    try {
      const payment =
        await this.paymentProviderService.getPaymentStatus(paymentId);

      // Atualiza o status no Firestore
      await this.firestore
        .collection('payments')
        .doc(paymentId.toString())
        .update({
          status: payment.status,
          statusDetail: payment.status_detail,
          updatedAt: new Date(),
        });

      return payment;
    } catch (error) {
      this.logger.error('Erro ao buscar status do pagamento:', error);
      throw new BadRequestException('Erro ao buscar status do pagamento');
    }
  }

  // Lista pagamentos com filtros
  async getPayments(filters?: { status?: string; orderId?: string }) {
    try {
      let query: Query | CollectionReference =
        this.firestore.collection('payments');

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters?.orderId) {
        query = query.where('orderId', '==', filters.orderId);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      this.logger.error('Erro ao listar pagamentos:', error);
      throw new BadRequestException('Erro ao listar pagamentos');
    }
  }

  // Processa webhook do provider configurado
  async processWebhook(notification: any) {
    try {
      const result =
        await this.paymentProviderService.handleWebhook(notification);

      if (result && result.paymentId) {
        // Atualiza o pagamento no Firestore
        await this.firestore
          .collection('payments')
          .doc(result.paymentId.toString())
          .update({
            status: result.status,
            statusDetail: result.statusDetail,
            updatedAt: new Date(),
          });

        // Aqui você pode adicionar lógica específica para torneios
        // Por exemplo, liberar inscrições quando o pagamento for aprovado
        if (result.status === 'approved') {
          await this.handleApprovedPayment(result.paymentId);
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  // Lida com pagamentos aprovados
  private async handleApprovedPayment(paymentId: number) {
    try {
      const paymentDoc = await this.firestore
        .collection('payments')
        .doc(paymentId.toString())
        .get();
      const paymentData = paymentDoc.data();

      if (paymentData?.orderId) {
        // Busca torneios relacionados a este pagamento
        const tournamentsSnapshot = await this.firestore
          .collection('tournaments')
          .where('paymentOrderId', '==', paymentData.orderId)
          .where('status', '==', 'PENDING_PAYMENT')
          .get();

        if (!tournamentsSnapshot.empty) {
          for (const doc of tournamentsSnapshot.docs) {
            await doc.ref.update({
              status: 'OPEN',
              paymentConfirmedAt: new Date(),
            });
            this.logger.log(
              `Torneio ${doc.id} liberado após pagamento aprovado.`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Erro ao processar pagamento aprovado:', error);
    }
  }

  // Métodos específicos para modo mock
  async approveMockPayment(paymentId: number) {
    try {
      const result =
        await this.paymentProviderService.approveMockPayment(paymentId);

      // Atualiza o pagamento no Firestore
      await this.firestore
        .collection('payments')
        .doc(paymentId.toString())
        .update({
          status: result.status,
          statusDetail: result.status_detail,
          updatedAt: new Date(),
        });

      // Processa a aprovação como se fosse um webhook
      await this.handleApprovedPayment(paymentId);

      return result;
    } catch (error) {
      this.logger.error('Erro ao aprovar pagamento mock:', error);
      throw new BadRequestException('Erro ao aprovar pagamento mock');
    }
  }

  getMockPayments() {
    return this.paymentProviderService.getMockPayments();
  }

  isMockMode() {
    return this.paymentProviderService.isMockMode();
  }

  // Lista inscrições de um torneio com status de pagamento
  async getTournamentRegistrations(tournamentId: string) {
    const registrationsSnapshot = await this.firestore
      .collection('tournaments')
      .doc(tournamentId)
      .collection('registrations')
      .get();

    const registrations = registrationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; paymentStatus?: string; [key: string]: any }>;

    return {
      tournamentId,
      registrations,
      summary: {
        total: registrations.length,
        paid: registrations.filter((r) => r.paymentStatus === 'PAID').length,
        pending: registrations.filter((r) => r.paymentStatus !== 'PAID').length,
      },
    };
  }
}
