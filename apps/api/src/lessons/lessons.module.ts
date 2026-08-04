import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  imports: [AuthModule], //ilerleme ve tamamlama endpointlerinde accestokenguard kullanacağızmız için auth modülünü import ettik. NestJS guard yapıları bir isteğin route handler’a ulaşıp ulaşmayacağına karar verir.
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
