import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '../users/entities/user.entity';
import { TournamentsService } from '../tournaments/tournaments.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PaymentsService {
  private readonly client: MercadoPagoConfig;
  private readonly firestore;

  constructor(
    private readonly configService: ConfigService,
    private readonly tournamentsService: TournamentsService,
    private readonly firebaseService: FirebaseService,
  ) {
    const accessToken = this.configService.get<string>(
      'mercadopago.accessToken',
    );
    if (!accessToken) {
      throw new InternalServerErrorException(
        'Mercado Pago access token not configured.',
      );
    }
    this.client = new MercadoPagoConfig({ accessToken });
    this.firestore = this.firebaseService.firestore;
  }

  async createPixPayment(createPaymentDto: CreatePaymentDto, user: User) {
    const { tournamentId, teamId } = createPaymentDto;

    const tournament = await this.tournamentsService.findOne(tournamentId);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const registrationRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId)
      .collection('registrations')
      .doc(teamId);

    const registrationDoc = await registrationRef.get();
    if (!registrationDoc.exists) {
      throw new NotFoundException('Team registration not found');
    }

    const registration = registrationDoc.data();
    if (registration.captainId !== user.uid) {
      throw new UnauthorizedException(
        'Only the team captain can generate the payment.',
      );
    }

    if (registration.paymentStatus !== 'PENDING') {
      throw new BadRequestException(
        'A payment for this registration is already processed or in progress.',
      );
    }

    const categoryInfo =
      tournament.categories[registration.gender]?.[registration.modality];
    if (!categoryInfo || !categoryInfo.enabled) {
      throw new BadRequestException(
        `The category for this registration is no longer available.`,
      );
    }

    const payment = new Payment(this.client);
    const totalPrice = tournament.pricePerPerson * categoryInfo.teamSize;

    const paymentResponse = await payment.create({
      body: {
        transaction_amount: totalPrice,
        description: `Inscrição para o torneio '${tournament.name}' - Time: ${registration.teamName}`,
        payment_method_id: 'pix',
        payer: {
          email: user.email,
          first_name: user.displayName || 'Usuário',
          last_name: 'Toque Play',
        },
        notification_url: 'https://webhook.site/sua-url-de-webhook-aqui', // TODO: Change to a real webhook URL
      },
    });

    const paymentId = paymentResponse.id;
    await registrationRef.update({ paymentId, paymentStatus: 'IN_PROGRESS' });

    if (!paymentResponse.point_of_interaction?.transaction_data) {
      throw new InternalServerErrorException(
        'Could not retrieve PIX data from payment provider.',
      );
    }

    return {
      paymentId,
      qrCode: paymentResponse.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64:
        paymentResponse.point_of_interaction.transaction_data.qr_code_base64,
    };
  }

  async handleWebhook(paymentId: string) {
    const paymentClient = new Payment(this.client);

    try {
      const payment = await paymentClient.get({ id: paymentId });

      if (payment && payment.status === 'approved') {
        const querySnapshot = await this.firestore
          .collectionGroup('registrations')
          .where('paymentId', '==', payment.id)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          const registrationDoc = querySnapshot.docs[0];
          await registrationDoc.ref.update({ paymentStatus: 'PAID' });

          // Here you could trigger a notification for the organizer and the captain
          console.log(
            `Payment confirmed for registration: ${registrationDoc.id}`,
          );
        }
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      // Even if we fail, we don't throw, to prevent MercadoPago from retrying indefinitely
    }
  }
}
