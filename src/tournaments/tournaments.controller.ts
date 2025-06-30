import {
  Controller,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
  Get,
  Param,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ProfilesGuard } from '../auth/guards/profiles.guard';
import { Profiles } from '../auth/decorators/profiles.decorator';
import { ProfileType } from '../users/entities/profile.enum';
import { RegisterTeamDto } from './dto/register-team.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @UseGuards(AuthGuard, ProfilesGuard)
  @Profiles(ProfileType.ORGANIZATION)
  create(
    @Body(new ValidationPipe()) createTournamentDto: CreateTournamentDto,
    @GetUser() user: User,
  ) {
    return this.tournamentsService.create(createTournamentDto, user.uid);
  }

  @Get()
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Get('organizer/my-tournaments')
  @UseGuards(AuthGuard, ProfilesGuard)
  @Profiles(ProfileType.ORGANIZATION)
  findOrganizerTournaments(@GetUser() user: User) {
    return this.tournamentsService.findTournamentsByOrganizer(user.uid);
  }

  @Post(':id/register-team')
  @UseGuards(AuthGuard, ProfilesGuard)
  @Profiles(ProfileType.ATHLETE)
  registerTeam(
    @Param('id') tournamentId: string,
    @GetUser() user: User,
    @Body(new ValidationPipe()) registerTeamDto: RegisterTeamDto,
  ) {
    return this.tournamentsService.registerTeam(
      tournamentId,
      user.uid,
      registerTeamDto,
    );
  }

  @Get('my-tournaments')
  @UseGuards(AuthGuard)
  async myTournaments(@GetUser() user: User) {
    if (user.profiles.includes(ProfileType.ORGANIZATION)) {
      return this.tournamentsService.findTournamentsByOrganizer(user.uid);
    } else if (user.profiles.includes(ProfileType.ATHLETE)) {
      return this.tournamentsService.findTournamentsByAthlete(user.uid);
    } else {
      return [];
    }
  }
}
