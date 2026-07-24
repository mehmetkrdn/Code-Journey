import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/guards/access-token.guard';
import { StreakService } from './streak.service';

@ApiTags('Streak')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('streak')
export class StreakController {
  constructor(
    private readonly streakService: StreakService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının günlük seri bilgisini getirir',
  })
  @ApiOkResponse({
    description:
      'Günlük seri bilgisi başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  getStreak(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.streakService.getStreak(
      request.user.sub,
    );
  }

  @Post('check-in')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının günlük aktivitesini kaydeder',
  })
  @ApiOkResponse({
    description:
      'Günlük aktivite başarıyla kaydedildi',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  checkIn(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.streakService.checkIn(
      request.user.sub,
    );
  }
}