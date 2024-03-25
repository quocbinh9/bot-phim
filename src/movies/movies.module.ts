import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/Movie';
import { Actor } from './entities/Actor';
import { Category } from './entities/Category';
import { Director } from './entities/Director';
import { Episode } from './entities/Episode';
import { Region } from './entities/Region';
import { Studio } from './entities/Studio';
import { Tag } from './entities/Tag';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Actor,
      Category,
      Director,
      Episode,
      Movie,
      Region,
      Studio,
      Tag,
    ])
  ],
})
export class MoviesModule { }
