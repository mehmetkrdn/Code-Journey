import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  ApiBadRequestResponse,
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
import { AddXpDto } from './dto/add-xp.dto';
import { ProgressionService } from './progression.service';

@ApiTags('Progression')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('progression')
export class ProgressionController {
  constructor(
    private readonly progressionService:
      ProgressionService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının XP ve level durumunu getirir',
  })
  @ApiOkResponse({
    description:
      'XP ve level bilgileri başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  getProgress(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.progressionService.getProgress(
      request.user.sub,
    );
  }

  @Post('test-xp')
  @ApiOperation({
    summary:
      'Geliştirme ortamında kullanıcıya test XP’si ekler',
  })
  @ApiOkResponse({
    description: 'XP başarıyla eklendi',
  })
  @ApiBadRequestResponse({
    description: 'XP miktarı geçersiz',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description:
      'Endpoint veya kullanıcı bulunamadı',
  })
  addTestXp(
    @Req() request: AuthenticatedRequest,
    @Body() addXpDto: AddXpDto,
  ) {
    const environment =
      this.configService.get<string>(
        'NODE_ENV',
      );

    if (environment === 'production') {
      throw new NotFoundException(
        'Endpoint bulunamadı.',
      );
    }

    return this.progressionService.addXp(
      request.user.sub,
      addXpDto.amount,
    );
  }
}

/*test-xp endpoint’i production ortamında çalışmayacak. Gerçek uygulamada XP, kullanıcının gönderdiği serbest bir sayıdan değil,
 ders tamamlama işleminin backend tarafından belirlediği ödülden gelecek.*/