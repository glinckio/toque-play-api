import { IsNotEmpty, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
