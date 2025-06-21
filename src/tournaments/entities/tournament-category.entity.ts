import {
  IsBoolean,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CategoryDetail {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(1)
  teamSize: number;
}

class CategoryType {
  @IsObject()
  @ValidateNested()
  @Type(() => CategoryDetail)
  '2x2': CategoryDetail;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryDetail)
  '4x4': CategoryDetail;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryDetail)
  '6x6': CategoryDetail;
}

export class TournamentCategories {
  @IsObject()
  @ValidateNested()
  @Type(() => CategoryType)
  masculino: CategoryType;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryType)
  feminino: CategoryType;

  @IsObject()
  @ValidateNested()
  @Type(() => CategoryType)
  misto: CategoryType;
}
