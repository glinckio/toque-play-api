import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { AuthGuard } from './guards/auth.guard';
import { ProfilesGuard } from './guards/profiles.guard';

@Module({
  imports: [forwardRef(() => UsersModule), FirebaseModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, ProfilesGuard],
  exports: [AuthService, AuthGuard, ProfilesGuard],
})
export class AuthModule {}
