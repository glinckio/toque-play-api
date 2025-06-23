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

    // Convert user profiles to uppercase for case-insensitive comparison
    const userProfiles = user.profiles.map((profile) => profile.toUpperCase());

    // Check if the user has at least one of the required profiles
    const hasProfile = requiredProfiles.some((profile) =>
      userProfiles.includes(profile),
    );
    console.log('[ProfilesGuard] Required Profiles:', requiredProfiles);
    console.log('[ProfilesGuard] User Profiles:', user.profiles);
    console.log('[ProfilesGuard] Has required profile:', hasProfile);

    return hasProfile;
  }
}
