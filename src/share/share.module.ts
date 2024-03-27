import { Module, forwardRef } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ShareController],
  providers: [ShareService]
})
export class ShareModule { }
