import {
  Body,
  Controller,
  Get,
  Param,
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

import { ChallengesService } from './challenges.service';

import { SubmitChallengeDto } from './dto/submit-challenge.dto';

@ApiTags('Challenges')
@Controller()
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  /*
   * Bir derse ait challenge'ları getirir.
   */
  @Get('lessons/:lessonId/challenges')
  @ApiOperation({
    summary: 'Bir derse ait challenge listesini getirir',
  })
  @ApiOkResponse({
    description: 'Challenge listesi başarıyla getirildi.',
  })
  @ApiNotFoundResponse({
    description: 'Ders bulunamadı.',
  })
  findByLesson(
    @Param('lessonId')
    lessonId: string,
  ) {
    return this.challengesService.findByLesson(lessonId);
  }

  /*
   * Kullanıcı challenge cevabını gönderir.
   */
  @Post('challenges/:id/submit')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Challenge cevabını gönderir',
  })
  @ApiOkResponse({
    description: 'Challenge cevabı kontrol edildi.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token geçersiz veya bulunamadı.',
  })
  @ApiNotFoundResponse({
    description: 'Challenge bulunamadı.',
  })
  submitAnswer(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    challengeId: string,

    @Body()
    dto: SubmitChallengeDto,
  ) {
    return this.challengesService.submitAnswer(
      request.user.sub,
      challengeId,
      dto.submittedAnswer,
    );
  }

  @Get('challenges/:id/progress')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kullanıcının challenge ilerlemesini getirir',
  })
  @ApiOkResponse({
    description: 'Challenge ilerlemesi başarıyla getirildi.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token geçersiz veya bulunamadı.',
  })
  @ApiNotFoundResponse({
    description: 'Challenge bulunamadı.',
  })
  getProgress(
    @Req()
    request: AuthenticatedRequest,

    @Param('id')
    challengeId: string,
  ) {
    return this.challengesService.getProgress(request.user.sub, challengeId);
  }

  @Get('lessons/:lessonId/challenges/progress')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Bir dersin challenge ilerlemesini getirir',
  })
  @ApiOkResponse({
    description: 'Ders challenge ilerlemesi başarıyla getirildi.',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token geçersiz veya bulunamadı.',
  })
  @ApiNotFoundResponse({
    description: 'Ders bulunamadı.',
  })
  getLessonChallengeProgress(
    @Req()
    request: AuthenticatedRequest,

    @Param('lessonId')
    lessonId: string,
  ) {
    return this.challengesService.getLessonChallengeProgress(
      request.user.sub,
      lessonId,
    );
  }
}
