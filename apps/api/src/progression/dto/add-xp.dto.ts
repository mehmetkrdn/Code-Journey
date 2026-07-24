import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class AddXpDto { 
  @ApiProperty({
    description:
      'Test amacıyla kullanıcıya eklenecek XP miktarı',
    example: 50,
    minimum: 1,
    maximum: 500,
  })
  @IsInt({
    message: 'XP miktarı tam sayı olmalıdır.',
  })
  @Min(1, {
    message: 'XP miktarı en az 1 olmalıdır.',
  })
  @Max(500, {
    message:
      'Tek işlemde en fazla 500 XP eklenebilir.',
  })
  amount: number;
}
