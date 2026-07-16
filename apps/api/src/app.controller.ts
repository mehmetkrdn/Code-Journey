import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
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