import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TournamentMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;
}
