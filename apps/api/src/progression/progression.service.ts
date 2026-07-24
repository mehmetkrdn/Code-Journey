import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { getLevelProgress } from './utils/level-calculator';

@Injectable()
export class ProgressionService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async getProgress(userId: string) {
    const user =
      await this.usersService.findProfileById(
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
        progression: getLevelProgress(
          user.totalXp,
        ),
      },
    };
  }

  async addXp(
    userId: string,
    amount: number,
  ) {
    const currentUser =
      await this.usersService.findById(userId);

    if (!currentUser) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    const oldLevel = currentUser.level;

    const result =
      await this.usersService.addXp(
        userId,
        amount,
      );

    const levelUp =
      result.user.level > oldLevel;

    return {
      success: true,
      message: levelUp
        ? `Tebrikler! ${result.user.level}. seviyeye ulaştınız.`
        : `${amount} XP başarıyla eklendi.`,
      data: {
        addedXp: amount,
        levelUp,
        previousLevel: oldLevel,
        currentLevel: result.user.level,
        ...result.progression,
      },
    };
  }
}

//controllere gelen istekler burada yapılır.