import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PrismaService } from './prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Backend ve veritabanı bağlantısını kontrol eder',
  })
  @ApiResponse({
    status: 200,
    description: 'Backend ve veritabanı bağlantısı sağlıklı',
  })
  async getHealth() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      success: true,
      service: 'code-journey-api',
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}