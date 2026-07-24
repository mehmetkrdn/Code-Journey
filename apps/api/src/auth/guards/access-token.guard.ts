import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequest = Request & {
  user: AccessTokenPayload;
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token =
      this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Access token bulunamadı.',
      );
    }

    try {
      const accessTokenSecret =
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        );

      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(
          token,
          {
            secret: accessTokenSecret,
          },
        );

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Access token geçersiz veya süresi dolmuş.',
      );
    }
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {
    const authorization =
      request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [type, token] =
      authorization.trim().split(/\s+/);

    return type === 'Bearer'
      ? token
      : undefined;
  }
}

// Bu AccessTokenGuard, gelen HTTP isteklerinde Authorization başlığında bulunan Bearer token'ı doğrulamak için kullanılır. Eğer token geçerli ise, payload bilgisi request nesnesine eklenir ve istek işleme devam eder. Aksi takdirde UnauthorizedException fırlatılır.