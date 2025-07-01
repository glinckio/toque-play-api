import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { Tournament } from './entities/tournament.entity';
import { TournamentStatus } from './entities/tournament-status.enum';
import { v4 as uuidv4 } from 'uuid';
import { RegisterTeamDto } from './dto/register-team.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class TournamentsService {
  private readonly firestore;
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly paymentsService: PaymentsService,
  ) {
    this.firestore = this.firebaseService.firestore;
  }

  async create(
    createTournamentDto: CreateTournamentDto,
    organizerId: string,
  ): Promise<any> {
    // Defina o valor da taxa de publicação do torneio
    const taxaPublicacao = 10.0; // Exemplo: R$ 10,00
    const orderId = `tournament_${uuidv4()}`;
    const descricao = `Taxa publicação torneio - ${createTournamentDto.name}`;

    // Gerar pagamento PIX usando Mercado Pago
    const pixPayment = await this.paymentsService.createPixPayment({
      amount: taxaPublicacao,
      description: descricao,
      orderId,
      payerEmail: 'organizador@toqueplay.com', // Pode ser dinâmico baseado no organizador
      payerFirstName: 'Organizador',
      payerLastName: 'ToquePlay',
      payerCpf: '00000000000', // Pode ser dinâmico baseado no organizador
    });

    const newTournament: Tournament = {
      id: uuidv4(),
      ...createTournamentDto,
      date: new Date(createTournamentDto.date),
      organizerId,
      status: TournamentStatus.PENDING_PAYMENT,
      paymentOrderId: orderId,
    };

    await this.firestore
      .collection('tournaments')
      .doc(newTournament.id)
      .set(newTournament);

    return {
      tournament: newTournament,
      pixPayment,
    };
  }

  // Para atletas - só torneios abertos (pagos)
  async findAll(): Promise<Tournament[]> {
    const snapshot = await this.firestore
      .collection('tournaments')
      .where('status', '==', TournamentStatus.OPEN)
      .get();

    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => doc.data() as Tournament);
  }

  // Para organizadores - todos os seus torneios (incluindo pendentes)
  async findAllForOrganizer(organizerId: string): Promise<Tournament[]> {
    const snapshot = await this.firestore
      .collection('tournaments')
      .where('organizerId', '==', organizerId)
      .get();

    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => doc.data() as Tournament);
  }

  // Para administradores - todos os torneios (incluindo pendentes)
  async findAllForAdmin(): Promise<Tournament[]> {
    const snapshot = await this.firestore.collection('tournaments').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => doc.data() as Tournament);
  }

  async findOne(id: string): Promise<Tournament> {
    const doc = await this.firestore.collection('tournaments').doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`Tournament with ID "${id}" not found`);
    }
    return doc.data() as Tournament;
  }

  async findTournamentsByOrganizer(organizerId: string) {
    const tournamentsSnapshot = await this.firestore
      .collection('tournaments')
      .where('organizerId', '==', organizerId)
      .get();

    if (tournamentsSnapshot.empty) {
      return [];
    }

    const tournaments = tournamentsSnapshot.docs.map(
      (doc) => doc.data() as Tournament,
    );

    const tournamentsWithTeams = await Promise.all(
      tournaments.map(async (tournament) => {
        const registrationsSnapshot = await this.firestore
          .collection('tournaments')
          .doc(tournament.id)
          .collection('registrations')
          .get();

        const registrations = registrationsSnapshot.docs.map((doc) =>
          doc.data(),
        );

        return {
          ...tournament,
          registrations,
        };
      }),
    );

    return tournamentsWithTeams;
  }

  async findTournamentsByAthlete(athleteId: string) {
    // Busca todos os torneios abertos
    const tournamentsSnapshot = await this.firestore
      .collection('tournaments')
      .where('status', '==', TournamentStatus.OPEN)
      .get();

    if (tournamentsSnapshot.empty) {
      return [];
    }

    const tournaments = tournamentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tournament[];

    // Para cada torneio, verifica se há inscrição com captainId = athleteId
    const result: Array<Tournament & { registrations: any[] }> = [];
    for (const tournament of tournaments) {
      const registrationsSnapshot = await this.firestore
        .collection('tournaments')
        .doc(tournament.id)
        .collection('registrations')
        .where('captainId', '==', athleteId)
        .get();
      if (!registrationsSnapshot.empty) {
        // Pode retornar também os dados da inscrição, se desejar
        const registrations = registrationsSnapshot.docs.map((doc) =>
          doc.data(),
        );
        result.push({ ...tournament, registrations });
      }
    }
    return result;
  }

  async registerTeam(
    tournamentId: string,
    captainId: string,
    registerTeamDto: RegisterTeamDto,
  ) {
    const { gender, modality, members, teamName, cpf } = registerTeamDto;

    const tournament = await this.findOne(tournamentId);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.OPEN) {
      throw new BadRequestException(
        'This tournament is not open for registration.',
      );
    }

    const categoryInfo = tournament.categories[gender]?.[modality];
    if (!categoryInfo || !categoryInfo.enabled) {
      throw new BadRequestException(
        `The category ${gender}/${modality} is not available for this tournament.`,
      );
    }

    const expectedTeamSize = categoryInfo.teamSize;
    if (members.length !== expectedTeamSize - 1) {
      throw new BadRequestException(
        `For the ${gender}/${modality} category, the team must have exactly ${expectedTeamSize} members (including the captain). You provided ${members.length + 1}.`,
      );
    }

    const registrationRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId)
      .collection('registrations');

    const existingRegistration = await registrationRef
      .where('captainId', '==', captainId)
      .where('modality', '==', modality)
      .get();
    if (!existingRegistration.empty) {
      throw new ConflictException(
        `You have already registered a team in the ${modality} category for this tournament.`,
      );
    }

    // Criar pagamento para inscrição do time
    const taxaInscricao = categoryInfo.registrationFee || 0; // Taxa de inscrição da categoria
    const orderId = `team_registration_${uuidv4()}`;
    const descricao = `Inscrição time ${teamName} - ${tournament.name} (${gender}/${modality})`;

    let pixPayment: any = null;
    let paymentId: number | null = null;

    if (taxaInscricao > 0) {
      // Buscar dados do usuário para o pagamento
      const userDoc = await this.firestore
        .collection('users')
        .doc(captainId)
        .get();
      const userData = userDoc.exists ? userDoc.data() : null;

      pixPayment = await this.paymentsService.createPixPayment({
        amount: taxaInscricao,
        description: descricao,
        orderId,
        payerEmail: userData?.email || 'atleta@toqueplay.com',
        payerFirstName: userData?.firstName || 'Atleta',
        payerLastName: userData?.lastName || 'ToquePlay',
        payerCpf: cpf,
      });

      paymentId = pixPayment.id;
    }

    const teamId = uuidv4();
    await registrationRef.doc(teamId).set({
      teamId,
      captainId,
      captainCpf: cpf,
      teamName,
      members,
      gender,
      modality,
      registeredAt: new Date(),
      paymentId: paymentId,
      paymentOrderId: orderId,
      registrationFee: taxaInscricao,
    });

    return {
      message: 'Team successfully registered!',
      teamId,
      pixPayment: taxaInscricao > 0 ? pixPayment : null,
    };
  }

  async findOneWithCaptainTeam(tournamentId: string, userId: string) {
    const doc = await this.firestore
      .collection('tournaments')
      .doc(tournamentId)
      .get();
    if (!doc.exists) {
      throw new NotFoundException(
        `Tournament with ID "${tournamentId}" not found`,
      );
    }
    const tournament = doc.data() as Tournament;

    // Busca o time do capitão (usuário logado)
    const registrationsSnapshot = await this.firestore
      .collection('tournaments')
      .doc(tournamentId)
      .collection('registrations')
      .where('captainId', '==', userId)
      .get();

    let myTeam: any = null;
    if (!registrationsSnapshot.empty) {
      myTeam = registrationsSnapshot.docs[0].data();
    }

    if (myTeam) {
      // Verificar se o torneio foi pago pelo organizador
      const tournamentPaymentConfirmed = tournament.paymentConfirmedAt != null;

      // Buscar status do pagamento da inscrição do time, se houver paymentId
      if (myTeam.paymentId) {
        const paymentDoc = await this.firestore
          .collection('payments')
          .doc(myTeam.paymentId.toString())
          .get();
        if (paymentDoc.exists) {
          const paymentData = paymentDoc.data();
          myTeam.paymentStatus = paymentData?.status || 'pending';
          myTeam.paymentStatusDetail =
            paymentData?.statusDetail || 'pending_waiting_payment';
        } else {
          myTeam.paymentStatus = 'pending';
          myTeam.paymentStatusDetail = 'payment_not_found';
        }
      } else if (myTeam.registrationFee > 0) {
        // Se tem taxa de inscrição mas não tem paymentId, significa que ainda não foi criado o pagamento
        myTeam.paymentStatus = 'pending';
        myTeam.paymentStatusDetail = 'payment_not_created';
      } else {
        // Se não tem taxa de inscrição, não precisa de pagamento
        myTeam.paymentStatus = 'free';
        myTeam.paymentStatusDetail = 'no_payment_required';
      }

      // Adicionar informação sobre o status do pagamento do torneio
      myTeam.tournamentPaymentConfirmed = tournamentPaymentConfirmed;
    }

    return {
      ...tournament,
      myTeam, // null se não estiver inscrito, ou os dados do time se estiver
    };
  }
}
