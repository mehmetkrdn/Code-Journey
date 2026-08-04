import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/guards/access-token.guard';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({
    summary: 'Yayınlanmış kursları listeler',
    description:
      'Kullanıcıların erişebileceği yayınlanmış kursları ve kurs bölümlerini getirir.',
  })
  @ApiOkResponse({
    description: 'Yayınlanmış kurslar başarıyla getirildi.',
  })
  findAll() {
    return this.coursesService.findAll();
  }
  @Get(':slug/progress')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Giriş yapan kullanıcının kurs ilerlemesini getirir',
  })
  @ApiParam({
    name: 'slug',
    example: 'java',
    description: 'Kursun benzersiz slug değeri',
  })
  @ApiOkResponse({
    description: 'Kurs ilerlemesi başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kurs bulunamadı veya yayınlanmadı',
  })
  getCourseProgress(
    @Req() request: AuthenticatedRequest,
    @Param('slug') slug: string,
  ) {
    return this.coursesService.getCourseProgress(slug, request.user.sub);
  }
  @Get(':slug')
  @ApiOperation({
    summary: 'Kurs detayını getirir',
    description:
      'Slug değerine göre kursu, bölümlerini ve yayınlanmış derslerini getirir.',
  })
  @ApiParam({
    name: 'slug',
    example: 'java',
    description: 'Kursun benzersiz slug değeri',
  })
  @ApiOkResponse({
    description: 'Kurs bilgileri başarıyla getirildi.',
  })
  @ApiNotFoundResponse({
    description: 'Kurs bulunamadı veya yayınlanmadı.',
  })
  findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }
}
