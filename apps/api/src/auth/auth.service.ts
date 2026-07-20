import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './types/token-payload.type';
import type { StringValue } from 'ms';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const username = registerDto.username.trim().toLowerCase();
    const displayName = registerDto.displayName?.trim();

    const existingEmail =
      await this.usersService.findByEmail(email);

    if (existingEmail) {
      throw new ConflictException(
        'Bu e-posta adresi zaten kullanılıyor.',
      );
    }

    const existingUsername =
      await this.usersService.findByUsername(username);

    if (existingUsername) {
      throw new ConflictException(
        'Bu kullanıcı adı zaten kullanılıyor.',
      );
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      12,
    );

    const user = await this.usersService.create({
      email,
      username,
      passwordHash,
      displayName,
    });

    return {
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: user,
    };
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.identifier
      .trim()
      .toLowerCase();

    const user =
      await this.usersService.findByEmailOrUsername(
        identifier,
      );

    if (!user) {
      throw new UnauthorizedException(
        'E-posta, kullanıcı adı veya şifre hatalı.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'E-posta, kullanıcı adı veya şifre hatalı.',
      );
    }

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const tokens =
      await this.generateTokens(payload);

    const refreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      12,
    );

    await this.usersService.updateRefreshTokenHash(
      user.id,
      refreshTokenHash,
    );

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          totalXp: user.totalXp,
          level: user.level,
          CurrentStreak: user.CurrentStreak,
          longestStreak: user.longestStreak,
          hearts: user.hearts,
          coins: user.coins,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }
  private async generateTokens(
    payload: TokenPayload,
  ) {
    const accessSecret =
      this.configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      );

    const refreshSecret =
      this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      );

    const accessExpiresIn =
    (this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) ?? '15m') as StringValue;


    const refreshExpiresIn =
    (this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) ?? '7d') as StringValue;

    const [accessToken, refreshToken] =
      await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: accessSecret,
          expiresIn: accessExpiresIn,
        }),
        this.jwtService.signAsync(payload, {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        }),
      ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async refresh(refreshToken: string) {
    const refreshSecret =
      this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      );

    let payload: TokenPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<TokenPayload>(
          refreshToken,
          {
            secret: refreshSecret,
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Refresh token geçersiz veya süresi dolmuş.',
      );
    }

    const user =
      await this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException(
        'Geçerli bir oturum bulunamadı.',
      );
    }

    const isRefreshTokenValid =
      await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException(
        'Refresh token geçersiz.',
      );
    }

    const newPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const newTokens =
      await this.generateTokens(newPayload);

    const newRefreshTokenHash =
      await bcrypt.hash(
        newTokens.refreshToken,
        12,
      );

    await this.usersService.updateRefreshTokenHash(
      user.id,
      newRefreshTokenHash,
    );

    return {
      success: true,
      message: 'Tokenlar başarıyla yenilendi.',
      data: newTokens,
    };
  }
  async logout(userId: string) {
    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(
        'Kullanıcı bulunamadı.',
      );
    }

    await this.usersService.updateRefreshTokenHash(
      userId,
      null,
    );

    return {
      success: true,
      message: 'Çıkış işlemi başarılı.',
    };
  }
}