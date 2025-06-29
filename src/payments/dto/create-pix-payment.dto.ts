import { IsString, IsNumber, IsEmail, IsNotEmpty, Min } from 'class-validator';

export class CreatePixPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsEmail()
  payerEmail: string;

  @IsString()
  @IsNotEmpty()
  payerFirstName: string;

  @IsString()
  @IsNotEmpty()
  payerLastName: string;

  @IsString()
  @IsNotEmpty()
  payerCpf: string;
}
