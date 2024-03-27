import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { Response } from 'express';
import * as _ from 'lodash'
import { ReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShareService {
  private appUrl: string = ""

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.appUrl = configService.get<string>('app.url')
  }

  async image(url: string, res: Response) {
    try {
      let config: AxiosRequestConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url,
        headers: {},
        responseType: "stream"
      };

      const response = await axios.request(config)
      const readableStream = ReadStream.from(response.data)
      return readableStream.pipe(res)
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write("file not found")
      return res.end();
    }
  }

  async hbs(url: string, query: Record<string, string>, res: Response) {
    let content = "file not found";
    try {
      if (url.endsWith('.m3u8')) {
        content = await this.getStreamm3u8(url);
        content = content.replaceAll('stream', this.appUrl + '/share/hbs?url=' + url.split('/').slice(0, -1).join('/') + '/stream')
        res.writeHead(200,
          {
            'Content-Type':
              'application/vnd.apple.mpegurl'
          });
        return res.end(content, 'utf-8');
      } else if (url.endsWith('.png')) {
        content = await this.getStreamm3u8(url, true);
        const readableStream = ReadStream.from(content)
        return readableStream.pipe(res)
      } else {
        throw new Error(content)
      }
      throw new Error(content)
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write(content)
      return res.end();
    }
  }

  player(url: string) {
    return {
      url: `${this.appUrl}/share/hbs`,
      hbsUrl: url
    };
  }

  async getStreamm3u8(url: string, isStream: boolean = false) {
    try {
      let config: AxiosRequestConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: url,
        headers: {
          'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          'Referer': 'https://embed.streamc.xyz/',
          'sec-ch-ua-mobile': '?0',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'sec-ch-ua-platform': '"macOS"'
        },
        responseType: !isStream ? "text" : 'stream'
      };

      const response = await axios.request(config)
      return response.data
    } catch (error) {
      throw new Error(error.message)
    }
  }
}
