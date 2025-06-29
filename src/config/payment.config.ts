import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  mercadoPagoEnabled: process.env.MERCADOPAGO_ENABLED === 'true',
  mpAccessToken: process.env.MP_ACCESS_TOKEN,
  mockPaymentEnabled: process.env.MOCK_PAYMENT_ENABLED === 'true',
}));
