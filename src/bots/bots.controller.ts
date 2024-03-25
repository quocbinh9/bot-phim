import { Controller, Get, Query, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('')
export class BotsController {
  constructor(
    private readonly proxyService: ProxyService
  ) { }

  @Get('generate')
  getIndex() {
    return {
      msg: 'Success'
    }
  }

  @Get('proxy/image')
  proxyImage(@Query('url') url: string, @Res() res) {
    return this.proxyService.proxyImage(url, res)
  }
}
