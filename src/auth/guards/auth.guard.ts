import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const token = authorization.split(' ')[1];

    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      const user = await this.usersService.findByUid(decodedToken.uid);

      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      request.user = user; // Attach user full profile to the request
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Invalid or expired token',
      );
    }
  }
}
