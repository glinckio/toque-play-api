import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  private readonly auth;
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {
    this.auth = this.firebaseService.auth;
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const userRecord = await this.auth.createUser({
      email,
      password,
    });

    await this.auth.generateEmailVerificationLink(email);
    // In a real app, you'd use a service to send this link via email.
    // For now, Firebase will handle sending the verification email if configured to.
    // We assume the default Firebase email template is sufficient.

    const user = await this.usersService.create({
      uid: userRecord.uid,
      email: userRecord.email,
    });

    return user;
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const { idToken } = socialLoginDto;
    const decodedToken = await this.auth.verifyIdToken(idToken);

    const { uid, email, name, picture } = decodedToken;

    let user = await this.usersService.findByUid(uid);

    if (!user) {
      user = await this.usersService.create({
        uid,
        email,
        displayName: name,
        photoURL: picture,
      });
    }

    return user;
  }
}
