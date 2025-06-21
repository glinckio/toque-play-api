import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TournamentCategories } from '../entities/tournament-category.entity';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  numberOfTeams: number;

  @IsNumber()
  pricePerPerson: number;

  @IsDateString()
  date: string;

  @ValidateNested()
  @Type(() => TournamentCategories)
  categories: TournamentCategories;
}
