import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { MAX_HEARTS } from './constants/hearts.constants';

@Injectable()
export class HeartsService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async getHearts(userId: string) {
    const user =
      await this.usersService.findHeartsByUserId(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    return {
      success: true,
      data: {
        hearts: user.hearts,
        maxHearts: MAX_HEARTS,
        isEmpty: user.hearts === 0,
        isFull: user.hearts === MAX_HEARTS,
      },
    };
  }

  async useHeart(userId: string) {
    const existingUser =
      await this.usersService.findHeartsByUserId(
        userId,
      );

    if (!existingUser) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    if (existingUser.hearts <= 0) {
      throw new BadRequestException(
        'Kullanılabilir canınız bulunmuyor.',
      );
    }

    const updatedUser =
      await this.usersService.useHeart(userId);

    if (!updatedUser) {
      throw new BadRequestException(
        'Can kullanılamadı.',
      );
    }

    return {
      success: true,
      message: 'Bir can kullanıldı.',
      data: {
        hearts: updatedUser.hearts,
        maxHearts: MAX_HEARTS,
        isEmpty: updatedUser.hearts === 0,
      },
    };
  }

  async restoreHeart(userId: string) {
    const user =
      await this.usersService.findHeartsByUserId(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    if (user.hearts >= MAX_HEARTS) {
      throw new BadRequestException(
        'Canlarınız zaten tamamen dolu.',
      );
    }

    const updatedUser =
      await this.usersService.restoreHearts(
        userId,
        1,
        MAX_HEARTS,
      );

    if (!updatedUser) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    return {
      success: true,
      message: 'Bir can yenilendi.',
      data: {
        hearts: updatedUser.hearts,
        maxHearts: MAX_HEARTS,
        isFull: updatedUser.hearts === MAX_HEARTS,
      },
    };
  }
}