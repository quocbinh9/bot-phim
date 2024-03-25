import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  return {
    url: process.env.DB_POSTGRES_URL
  };
});
