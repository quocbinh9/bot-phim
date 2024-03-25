import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { Response } from 'express';
import * as _ from 'lodash'
import { ReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  constructor(
  ) { }

  async proxyImage(url: string, res: Response) {
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
}
