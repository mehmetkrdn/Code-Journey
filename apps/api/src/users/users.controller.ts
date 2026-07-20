import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Tüm kullanıcıları listeler',
  })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı listesi başarıyla getirildi',
  })
  async findAll() {
    const users = await this.usersService.findAll();

    return {
      success: true,
      count: users.length,
      data: users,
    };
  }
}