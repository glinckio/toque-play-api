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

@Injectable()
export class TournamentsService {
  private readonly firestore;
  constructor(private readonly firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.firestore;
  }

  async create(
    createTournamentDto: CreateTournamentDto,
    organizerId: string,
  ): Promise<Tournament> {
    const newTournament: Tournament = {
      id: uuidv4(),
      ...createTournamentDto,
      date: new Date(createTournamentDto.date),
      organizerId,
      status: TournamentStatus.OPEN,
    };

    await this.firestore
      .collection('tournaments')
      .doc(newTournament.id)
      .set(newTournament);

    return newTournament;
  }

  async findAll(): Promise<Tournament[]> {
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

  async registerTeam(
    tournamentId: string,
    captainId: string,
    registerTeamDto: RegisterTeamDto,
  ) {
    const { gender, modality, members, teamName } = registerTeamDto;

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
      teamName,
      members,
      gender,
      modality,
      registeredAt: new Date(),
      paymentStatus: 'PENDING',
    });

    const totalPrice = tournament.pricePerPerson * expectedTeamSize;

    return {
      message: 'Team successfully registered. Proceed to payment.',
      teamId,
      totalPrice,
    };
  }
}
