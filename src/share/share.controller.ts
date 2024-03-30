import { Controller, Get, Query, Render, Res } from '@nestjs/common';
import { ShareService } from './share.service';

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
  player(@Query('url') url: string) {
    return this.shareService.player(url)
  }
}
