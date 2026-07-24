import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class SpendCoinsDto {
  @ApiProperty({
    description: 'Harcanacak jeton miktarı',
    example: 25,
    minimum: 1,
    maximum: 10000,
  })
  @IsInt({
    message: 'Jeton miktarı tam sayı olmalıdır.',
  })
  @Min(1, {
    message: 'En az 1 jeton harcanabilir.',
  })
  @Max(10000, {
    message:
      'Tek işlemde en fazla 10000 jeton harcanabilir.',
  })
  amount: number;
}

//bu kod sayesinde kullanıcı -50, 2.5 gibi değerleri harcayamaz