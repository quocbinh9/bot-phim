import { Module, forwardRef } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule { }
