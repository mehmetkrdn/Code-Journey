import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
//ValidationPipe, DTO üzerinde tanımlanan kuralları gelen tüm isteklerde uygular.
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Yeni access token üretmek için kullanılan refresh token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Refresh token boş bırakılamaz.',
  })
  refreshToken: string;
}