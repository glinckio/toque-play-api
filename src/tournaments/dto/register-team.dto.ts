import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../entities/gender.enum';
import { Modality } from '../entities/modality.enum';
import { Type } from 'class-transformer';
import { TournamentMemberDto } from './tournament-member.dto';

export class RegisterTeamDto {
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsEnum(Modality)
  @IsNotEmpty()
  modality: Modality;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TournamentMemberDto)
  members: TournamentMemberDto[];
}
