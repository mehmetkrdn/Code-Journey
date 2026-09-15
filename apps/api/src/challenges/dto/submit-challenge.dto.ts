import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SubmitChallengeDto {
  @ApiProperty({
    description: 'Kullanıcının challenge için gönderdiği cevap',
    example: {
      answer: 'int',
    },
  })
  @IsObject()
  submittedAnswer: Record<string, unknown>;
}
