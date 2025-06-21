import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProfileType } from '../../users/entities/profile.enum';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredProfiles = this.reflector.getAllAndOverride<ProfileType[]>(
      'profiles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredProfiles) {
      return true; // No specific profiles required, access granted
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user || !user.profiles) {
      return false; // User not found or has no profiles, access denied
    }

    return requiredProfiles.some((profile) => user.profiles.includes(profile));
  }
}
