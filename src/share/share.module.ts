import { Module, forwardRef } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { ConfigModule } from '@nestjs/config';
import { MoviesModule } from 'src/movies/movies.module';
import { BotsModule } from 'src/bots/bots.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => MoviesModule),
    forwardRef(() => BotsModule)
  ],
  controllers: [ShareController],
  providers: [ShareService]
})
export class ShareModule { }
