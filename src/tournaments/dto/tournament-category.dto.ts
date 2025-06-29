import {
  IsBoolean,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TournamentCategoryDetailsDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @ValidateIf((o) => o.enabled === true)
  @Min(1, {
    message: 'Team size must be at least 1 if the category is enabled.',
  })
  teamSize: number;

  @IsNumber()
  @ValidateIf((o) => o.enabled === true)
  @Min(0, {
    message: 'Price must be at least 0 if the category is enabled.',
  })
  price: number;
}

export class TournamentModalitiesDto {
  @ValidateNested()
  @Type(() => TournamentCategoryDetailsDto)
  DOUBLES: TournamentCategoryDetailsDto;

  @ValidateNested()
  @Type(() => TournamentCategoryDetailsDto)
  QUARTETS: TournamentCategoryDetailsDto;

  @ValidateNested()
  @Type(() => TournamentCategoryDetailsDto)
  SIXES: TournamentCategoryDetailsDto;
}

export class TournamentCategoriesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TournamentModalitiesDto)
  MALE: TournamentModalitiesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => TournamentModalitiesDto)
  FEMALE: TournamentModalitiesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => TournamentModalitiesDto)
  MIXED: TournamentModalitiesDto;
}
