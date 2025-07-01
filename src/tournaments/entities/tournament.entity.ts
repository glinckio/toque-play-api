import { TournamentStatus } from './tournament-status.enum';
import { TournamentCategoriesDto } from '../dto/tournament-category.dto';

export class Tournament {
  id: string;
  name: string;
  description: string;
  numberOfTeams: number;
  pricePerPerson: number;
  status: TournamentStatus;
  date: Date; // Using a single Date object for simplicity
  categories: TournamentCategoriesDto;
  organizerId: string;
  paymentTxid?: string;
  paymentOrderId?: string;
  paymentConfirmedAt?: Date;
}
