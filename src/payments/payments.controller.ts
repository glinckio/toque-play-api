import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pix')
  @UseGuards(AuthGuard)
  createPixPayment(
    @Body(new ValidationPipe()) createPaymentDto: CreatePaymentDto,
    @GetUser() user: User,
  ) {
    return this.paymentsService.createPixPayment(createPaymentDto, user);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() payload: any) {
    // We get the payment id from the query parameter for some notification types
    const paymentId = payload?.data?.id;
    if (payload.type === 'payment' && paymentId) {
      return this.paymentsService.handleWebhook(paymentId);
    }
    // We return OK for any other notifications to acknowledge receipt
    return;
  }
}
