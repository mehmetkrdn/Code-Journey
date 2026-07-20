import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from './guards/access-token.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Yeni kullanıcı oluşturur',
  })
  @ApiCreatedResponse({
    description: 'Kullanıcı başarıyla oluşturuldu',
  })
  @ApiBadRequestResponse({
    description: 'Gönderilen bilgiler geçersiz',
  })
  @ApiConflictResponse({
    description:
      'E-posta veya kullanıcı adı zaten kullanılıyor',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Kullanıcı girişi yapar',
  })
  @ApiOkResponse({
    description:
      'Giriş başarılı ve tokenlar oluşturuldu',
  })
  @ApiBadRequestResponse({
    description: 'Gönderilen bilgiler geçersiz',
  })
  @ApiUnauthorizedResponse({
    description:
      'E-posta, kullanıcı adı veya şifre hatalı',
  })
  async login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary:
      'Refresh token kullanarak yeni tokenlar üretir',
  })
  @ApiOkResponse({
    description:
      'Access ve refresh token başarıyla yenilendi',
  })
  @ApiBadRequestResponse({
    description: 'Refresh token alanı geçersiz',
  })
  @ApiUnauthorizedResponse({
    description:
      'Refresh token geçersiz veya süresi dolmuş',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.refresh(
      refreshTokenDto.refreshToken,
    );
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kullanıcının oturumunu sonlandırır',
  })
  @ApiOkResponse({
    description: 'Çıkış işlemi başarılı',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı veya geçersiz',
  })
  async logout(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.authService.logout(
      request.user.sub,
    );
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının token bilgilerini getirir',
  })
  @ApiOkResponse({
    description: 'Token geçerli',
  })
  @ApiUnauthorizedResponse({
    description:
      'Token bulunamadı, geçersiz veya süresi dolmuş',
  })
  getProfile(
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      success: true,
      data: {
        userId: request.user.sub,
        email: request.user.email,
        username: request.user.username,
      },
    };
  }
}