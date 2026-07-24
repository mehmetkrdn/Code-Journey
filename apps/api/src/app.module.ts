import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { ProgressionModule } from './progression/progression.module';
import { HeartsModule } from './hearts/hearts.module';
import { CoinsModule } from './coins/coins.module';
import { StreakModule } from './streak/streak.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    ProgressionModule,
    HeartsModule,
    CoinsModule,
    StreakModule,
  ],
  controllers: [AppController],
})
export class AppModule {}