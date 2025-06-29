import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProfileType } from '../entities/profile.enum';

export class UpdateProfilesDto {
  @IsArray()
  @IsEnum(ProfileType, { each: true })
  @IsNotEmpty()
  profiles: ProfileType[];
}

export class UpdatePixKeyDto {
  @IsString()
  @IsOptional()
  pixKey?: string;
}
