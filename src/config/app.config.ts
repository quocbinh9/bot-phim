import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    telegramToken: process.env.BOT_TOKEN,
    telegramUsername: process.env.BOT_USERNAME,
    url: process.env.APP_URL
  };
});