import { registerAs } from '@nestjs/config';

export default registerAs('mercadopago', () => ({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
}));
