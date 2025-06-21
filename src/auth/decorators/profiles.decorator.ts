import { SetMetadata } from '@nestjs/common';
import { ProfileType } from '../../users/entities/profile.enum';

export const Profiles = (...profiles: ProfileType[]) =>
  SetMetadata('profiles', profiles);
