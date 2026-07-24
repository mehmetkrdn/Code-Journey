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
import { CoinsService } from './coins.service';
import { AddCoinsDto } from './dto/add-coins.dto';
import { SpendCoinsDto } from './dto/spend-coins.dto';

@ApiTags('Coins')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('coins')
export class CoinsController {
  constructor(
    private readonly coinsService: CoinsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının jeton bilgisini getirir',
  })
  @ApiOkResponse({
    description:
      'Jeton bilgisi başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  getCoins(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.coinsService.getCoins(
      request.user.sub,
    );
  }

  @Post('spend')
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının jeton harcamasını sağlar',
  })
  @ApiOkResponse({
    description: 'Jeton başarıyla harcandı',
  })
  @ApiBadRequestResponse({
    description:
      'Jeton miktarı geçersiz veya kullanıcının yeterli jetonu yok',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı bulunamadı',
  })
  spendCoins(
    @Req() request: AuthenticatedRequest,
    @Body() spendCoinsDto: SpendCoinsDto,
  ) {
    return this.coinsService.spendCoins(
      request.user.sub,
      spendCoinsDto.amount,
    );
  }

  @Post('test-add')
  @ApiOperation({
    summary:
      'Geliştirme ortamında kullanıcıya test jetonu ekler',
  })
  @ApiOkResponse({
    description: 'Test jetonu başarıyla eklendi',
  })
  @ApiBadRequestResponse({
    description: 'Jeton miktarı geçersiz',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  @ApiNotFoundResponse({
    description:
      'Endpoint veya kullanıcı bulunamadı',
  })
  addTestCoins(
    @Req() request: AuthenticatedRequest,
    @Body() addCoinsDto: AddCoinsDto,
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

    return this.coinsService.addCoins(
      request.user.sub,
      addCoinsDto.amount,
    );
  }
}