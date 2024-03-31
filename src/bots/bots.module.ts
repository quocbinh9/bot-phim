import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/Member';
import { BotsService } from './bots.service';
import { Message } from './entities/Message';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  providers: [BotsService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Member,
      Message
    ]),
    forwardRef(() => MoviesModule)
  ],
  exports: [BotsService]
})
export class BotsModule { }
