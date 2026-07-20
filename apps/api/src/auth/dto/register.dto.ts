import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'mehmet@example.com',
    description: 'Kullanıcının benzersiz e-posta adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @MaxLength(150, {
    message: 'E-posta adresi en fazla 150 karakter olabilir.',
  })
  email: string;

  @ApiProperty({
    example: 'mehmetkordon',
    description: 'Kullanıcının benzersiz kullanıcı adı',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3, {
    message: 'Kullanıcı adı en az 3 karakter olmalıdır.',
  })
  @MaxLength(30, {
    message: 'Kullanıcı adı en fazla 30 karakter olabilir.',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.',
  })
  username: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Kullanıcı şifresi',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, {
    message: 'Şifre en az 8 karakter olmalıdır.',
  })
  @MaxLength(72, {
    message: 'Şifre en fazla 72 karakter olabilir.',
  })
  password: string;

  @ApiPropertyOptional({
    example: 'Mehmet Kordon',
    description: 'Ekranda gösterilecek kullanıcı adı',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'Görünen ad en az 2 karakter olmalıdır.',
  })
  @MaxLength(50, {
    message: 'Görünen ad en fazla 50 karakter olabilir.',
  })
  displayName?: string;
}