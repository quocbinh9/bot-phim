import { Controller, Get, Query, Render, Res } from '@nestjs/common';
import { ShareService } from './share.service';
import { ReadStream } from 'fs';

@Controller('')
export class ShareController {
  constructor(
    private readonly shareService: ShareService
  ) { }

  @Get('share/image')
  image(@Query('url') url: string, @Res() res) {
    return this.shareService.image(url, res)
  }

  @Get('share/hbs')
  hbs(@Query('url') url: string, @Query() query, @Res() res) {
    return this.shareService.hbs(url, query, res)
  }

  @Get('share/player')
  // @Render('telegram-web-app.hbs')
  @Render('telegram-iframe.hbs')
  player(@Query('url') url: string, @Query('nextUrl') nextUrl: string,) {
    return this.shareService.player(url, nextUrl)
  }

  @Get('share/player/next-episode')
  nextEpisode(
    @Query('serverName') serverName: string,
    @Query('slugMovie') slugMovie: string,
    @Query('slugEpisode') slugEpisode: string,
    @Query('chatId') chatId: number,
    @Query('messageId') messageId: number
  ) {
    return this.shareService.nextEpisode(serverName, slugMovie, slugEpisode, chatId, messageId)
  }
}
