import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { ProgressionController } from './progression.controller';
import { ProgressionService } from './progression.service';
@Module({
  imports: [UsersModule],
  controllers: [ProgressionController],
  providers: [ProgressionService],
  exports: [ProgressionService],
})
export class ProgressionModule {}