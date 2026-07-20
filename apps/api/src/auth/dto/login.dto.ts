import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'mehmet@codejourney.com',
    description: 'Kullanıcının e-posta adresi veya kullanıcı adı',
  })
  @IsString()
  @IsNotEmpty({
    message: 'E-posta veya kullanıcı adı boş bırakılamaz.',
  })
  @MaxLength(150, {
    message: 'Giriş bilgisi en fazla 150 karakter olabilir.',
  })
  identifier: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Kullanıcının şifresi',
  })
  @IsString()
  @IsNotEmpty({
    message: 'Şifre boş bırakılamaz.',
  })
  @MinLength(8, {
    message: 'Şifre en az 8 karakter olmalıdır.',
  })
  @MaxLength(72, {
    message: 'Şifre en fazla 72 karakter olabilir.',
  })
  password: string;
}