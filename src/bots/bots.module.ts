import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotsController } from './bots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/Member';
import { BotsService } from './bots.service';
import { Message } from './entities/Message';
import { ProxyService } from './proxy.service';
import { TheMovieDbService } from './themoviedb.service';
import { NguoncService } from './nguonc.service';

@Module({
  providers: [BotsService, ProxyService, TheMovieDbService, NguoncService],
  controllers: [BotsController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Member,
      Message
    ])
  ],
})
export class BotsModule { }
