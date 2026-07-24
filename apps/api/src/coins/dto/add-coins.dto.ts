import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class AddCoinsDto {
  @ApiProperty({
    description:
      'Geliştirme ortamında kullanıcıya eklenecek test jetonu',
    example: 100,
    minimum: 1,
    maximum: 10000,
  })
  @IsInt({
    message: 'Jeton miktarı tam sayı olmalıdır.',
  })
  @Min(1, {
    message: 'Eklenecek jeton miktarı en az 1 olmalıdır.',
  })
  @Max(10000, {
    message:
      'Tek işlemde en fazla 10000 jeton eklenebilir.',
  })
  amount: number;
}
/*
Gerçek uygulamada bu endpoint kullanılmayacak. Jetonlar ileride:

Ders tamamlama
Günlük görev
Başarı kazanma
Seri koruma
Etkinlik ödülü

gibi işlemler sonucunda backend tarafından verilecek.
*/
