import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      msg: 'Server running...',
      version: '1.0.2'
    };
  }
}
