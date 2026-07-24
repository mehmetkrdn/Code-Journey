import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının profil bilgilerini getirir',
  })
  @ApiOkResponse({
    description:
      'Profil bilgileri başarıyla getirildi',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı, geçersiz veya süresi dolmuş',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı profili bulunamadı',
  })
  async getProfile(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.profileService.getProfile(
      request.user.sub,
    );
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Giriş yapan kullanıcının profilini günceller',
  })
  @ApiOkResponse({
    description: 'Profil başarıyla güncellendi',
  })
  @ApiBadRequestResponse({
    description:
      'Gönderilen profil bilgileri geçersiz',
  })
  @ApiConflictResponse({
    description:
      'Kullanıcı adı başka bir kullanıcı tarafından kullanılıyor',
  })
  @ApiUnauthorizedResponse({
    description:
      'Access token bulunamadı, geçersiz veya süresi dolmuş',
  })
  @ApiNotFoundResponse({
    description: 'Kullanıcı profili bulunamadı',
  })
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(
      request.user.sub,
      updateProfileDto,
    );
  }
}

//Bu endpoint public değildir. Şu koruma uygulanır: AccessTokenGuard, yani kullanıcı giriş yapmış olmalıdır. Giriş yapmamış kullanıcılar bu endpointi kullanamaz.
//Kullanıcı ID’si ise JWT payload içindeki: request.user.sub alanından alınır. Bu ID, profileService.getProfile() metoduna parametre olarak verilir ve ilgili kullanıcının profil bilgileri döndürülür.
