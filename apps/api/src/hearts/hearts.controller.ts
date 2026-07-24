import {
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
import { HeartsService } from './hearts.service';

@ApiTags('Hearts')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('hearts')
export class HeartsController {
  constructor(
    private readonly heartsService: HeartsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının can bilgisini getirir',
  })
  @ApiOkResponse({
    description:
      'Can bilgisi başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  getHearts(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.heartsService.getHearts(
      request.user.sub,
    );
  }

  @Post('use')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının bir canını kullanır',
  })
  @ApiOkResponse({
    description: 'Bir can başarıyla kullanıldı',
  })
  @ApiBadRequestResponse({
    description:
      'Kullanıcının kullanılabilir canı bulunmuyor',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  useHeart(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.heartsService.useHeart(
      request.user.sub,
    );
  }

  @Post('test-restore')
  @ApiOperation({
    summary:
      'Geliştirme ortamında bir can yeniler',
  })
  @ApiOkResponse({
    description: 'Bir can başarıyla yenilendi',
  })
  @ApiBadRequestResponse({
    description:
      'Kullanıcının canları zaten tamamen dolu',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description:
      'Endpoint veya kullanıcı bulunamadı',
  })
  restoreTestHeart(
    @Req() request: AuthenticatedRequest,
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

    return this.heartsService.restoreHeart(
      request.user.sub,
    );
  }
}