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

  async findOne(id: string): Promise<Tournament | null> {
    const doc = await this.firestore.collection('tournaments').doc(id).get();
    if (!doc.exists) {
      return null;
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
    const result = [];
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
    });

    return {
      message: 'Team successfully registered!',
      teamId,
    };
  }
}
