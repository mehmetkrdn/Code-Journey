import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Kullanıcının görünen adı',
    example: 'Mehmet Kordon',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: 'Görünen ad metin olmalıdır.',
  })
  @MaxLength(50, {
    message:
      'Görünen ad en fazla 50 karakter olabilir.',
  })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Kullanıcının benzersiz kullanıcı adı',
    example: 'mehmetkordon',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({
    message: 'Kullanıcı adı metin olmalıdır.',
  })
  @Length(3, 30, {
    message:
      'Kullanıcı adı 3 ile 30 karakter arasında olmalıdır.',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Kullanıcı adı yalnızca harf, sayı ve alt çizgi içerebilir.',
  })
  username?: string;
}