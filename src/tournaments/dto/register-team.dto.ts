import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../entities/gender.enum';
import { Modality } from '../entities/modality.enum';

class TeamMemberDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;
}

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  members: TeamMemberDto[];
}
