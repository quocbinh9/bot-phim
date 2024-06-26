import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import { MoviesModule } from './movies/movies.module';
import { BotsModule } from './bots/bots.module';
import { ShareModule } from './share/share.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig
      ],
    }),
    DatabaseModule,
    BotsModule,
    ShareModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
