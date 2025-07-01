import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  Query,
  Param,
  Put,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pix')
  async createPixPayment(@Body() createPixPaymentDto: CreatePixPaymentDto) {
    this.logger.log('Criando pagamento PIX:', createPixPaymentDto);
    return this.paymentsService.createPixPayment(createPixPaymentDto);
  }

  @Get('status/:paymentId')
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    const id = parseInt(paymentId, 10);
    if (isNaN(id)) {
      throw new Error('ID do pagamento inválido');
    }
    return this.paymentsService.getPaymentStatus(id);
  }

  @Get('list')
  async getPayments(
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.paymentsService.getPayments({ status, orderId });
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log('Webhook recebido:', JSON.stringify(body));
    return this.paymentsService.processWebhook(body);
  }

  // Endpoints específicos para modo mock
  @Get('mock/status')
  async getMockStatus() {
    return {
      isMockMode: this.paymentsService.isMockMode(),
      message: this.paymentsService.isMockMode()
        ? 'Sistema em modo mock - pagamentos simulados'
        : 'Sistema em modo real - Mercado Pago ativo',
    };
  }

  @Get('mock/payments')
  async getMockPayments() {
    if (!this.paymentsService.isMockMode()) {
      throw new Error('Este endpoint só está disponível em modo mock');
    }
    return this.paymentsService.getMockPayments();
  }

  @Put('mock/approve/:paymentId')
  async approveMockPayment(@Param('paymentId') paymentId: string) {
    this.logger.log(
      `Tentando aprovar pagamento mock - ID recebido: ${paymentId}, tipo: ${typeof paymentId}`,
    );
    const id = Number(paymentId);
    this.logger.log(
      `ID convertido: ${id}, tipo: ${typeof id}, isNaN: ${isNaN(id)}`,
    );

    if (isNaN(id)) {
      throw new Error('ID do pagamento inválido');
    }

    return this.paymentsService.approveMockPayment(id);
  }

  @Get('tournament/:tournamentId/registrations')
  async getTournamentRegistrations(
    @Param('tournamentId') tournamentId: string,
  ) {
    return this.paymentsService.getTournamentRegistrations(tournamentId);
  }
}
