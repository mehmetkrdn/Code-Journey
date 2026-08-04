import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/guards/access-token.guard';
import { LessonsService } from './lessons.service';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Yayınlanmış ders içeriğini getirir',
  })
  @ApiParam({
    name: 'id',
    description: 'Dersin UUID değeri',
  })
  @ApiOkResponse({
    description: 'Ders içeriği başarıyla getirildi',
  })
  @ApiNotFoundResponse({
    description: 'Ders bulunamadı veya yayınlanmadı',
  })
  findById(@Param('id') lessonId: string) {
    return this.lessonsService.findById(lessonId);
  }

  @Get(':id/progress')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Giriş yapan kullanıcının ders ilerlemesini getirir',
  })
  @ApiParam({
    name: 'id',
    description: 'Dersin UUID değeri',
  })
  @ApiOkResponse({
    description: 'Ders ilerlemesi başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Ders bulunamadı veya yayınlanmadı',
  })
  getProgress(
    @Req() request: AuthenticatedRequest,
    @Param('id') lessonId: string,
  ) {
    return this.lessonsService.getProgress(request.user.sub, lessonId);
  }

  @Post(':id/complete')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dersi tamamlar ve ilk tamamlamada ödül verir',
  })
  @ApiParam({
    name: 'id',
    description: 'Dersin UUID değeri',
  })
  @ApiOkResponse({
    description: 'Ders başarıyla tamamlandı',
  })
  @ApiForbiddenResponse({
    description: 'Ders kilitli; önceki ders tamamlanmalı',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Ders veya kullanıcı bulunamadı',
  })
  completeLesson(
    @Req() request: AuthenticatedRequest,
    @Param('id') lessonId: string,
  ) {
    return this.lessonsService.completeLesson(request.user.sub, lessonId);
  }
}

/*
NestJS’te controller’lar gelen istekleri karşılar ve ilgili servis metoduna yönlendirir. 
Swagger dekoratörleri ise endpoint açıklamalarını OpenAPI arayüzünde görünür hale getirir.
*/
