import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ProfileType } from '../entities/profile.enum';

export class UpdateProfilesDto {
  @IsArray()
  @IsEnum(ProfileType, { each: true })
  @IsNotEmpty()
  profiles: ProfileType[];
}
