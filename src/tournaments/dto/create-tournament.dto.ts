import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TournamentCategoriesDto } from './tournament-category.dto';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  numberOfTeams: number;

  @IsNumber()
  pricePerPerson: number;

  @IsDateString()
  date: string;

  @ValidateNested()
  @Type(() => TournamentCategoriesDto)
  categories: TournamentCategoriesDto;
}
