import {
  Controller,
  Patch,
  UseGuards,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { auth } from 'firebase-admin';
import { UpdateProfilesDto, UpdatePixKeyDto } from './dto/update-profiles.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profiles')
  @UseGuards(AuthGuard)
  updateProfiles(
    @GetUser() user: auth.DecodedIdToken,
    @Body(new ValidationPipe()) updateProfilesDto: UpdateProfilesDto,
  ) {
    return this.usersService.updateProfiles(
      user.uid,
      updateProfilesDto.profiles,
    );
  }

  @Patch('pix-key')
  @UseGuards(AuthGuard)
  updatePixKey(
    @GetUser() user: auth.DecodedIdToken,
    @Body(new ValidationPipe()) updatePixKeyDto: UpdatePixKeyDto,
  ) {
    return this.usersService.updatePixKey(
      user.uid,
      updatePixKeyDto.pixKey || '',
    );
  }
}
