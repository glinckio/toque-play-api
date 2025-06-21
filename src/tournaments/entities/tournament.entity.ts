import { TournamentStatus } from './tournament-status.enum';
import { TournamentCategories } from './tournament-category.entity';

export class Tournament {
  id: string;
  name: string;
  description: string;
  numberOfTeams: number;
  pricePerPerson: number;
  status: TournamentStatus;
  date: Date; // Using a single Date object for simplicity
  categories: TournamentCategories;
  organizerId: string;
}
