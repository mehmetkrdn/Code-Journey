import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import {
  getDifferenceInUtcDays,
  getUtcDayStart,
} from './utils/streak-date.utils';

@Injectable()
export class StreakService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async getStreak(userId: string) {
    const user =
      await this.usersService.findStreakByUserId(
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
        currentStreak: user.CurrentStreak,
        longestStreak: user.longestStreak,
        lastActivityDate:
          user.lastActivityDate,
        hasActivityToday:
          this.hasActivityToday(
            user.lastActivityDate,
          ),
      },
    };
  }

  async checkIn(userId: string) {
    const user =
      await this.usersService.findStreakByUserId(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    const today = getUtcDayStart(new Date());

    if (!user.lastActivityDate) {
      return this.createFirstStreak(
        userId,
        today,
        user.longestStreak,
      );
    }

    const dayDifference =
      getDifferenceInUtcDays(
        today,
        user.lastActivityDate,
      );

    if (dayDifference === 0) {
      return {
        success: true,
        message:
          'Bugünkü günlük aktivite daha önce tamamlandı.',
        data: {
          streakIncreased: false,
          streakReset: false,
          currentStreak:
            user.CurrentStreak,
          longestStreak:
            user.longestStreak,
          lastActivityDate:
            user.lastActivityDate,
        },
      };
    }

    const previousStreak =
      user.CurrentStreak;

    const streakReset =
      dayDifference > 1;

    const newCurrentStreak =
      dayDifference === 1
        ? previousStreak + 1
        : 1;

    const newLongestStreak = Math.max( //Böylece en uzun seri hiçbir zaman azalmaz.
      user.longestStreak,
      newCurrentStreak,
    );

    const updatedUser =
      await this.usersService.updateStreak(
        userId,
        {
          CurrentStreak:
            newCurrentStreak,
          longestStreak:
            newLongestStreak,
          lastActivityDate: today,
        },
      );

    return {
      success: true,
      message: streakReset
        ? 'Günlük seri yeniden başlatıldı.'
        : `Günlük seriniz ${newCurrentStreak} güne ulaştı.`,
      data: {
        streakIncreased: true,
        streakReset,
        previousStreak,
        currentStreak:
          updatedUser.CurrentStreak,
        longestStreak:
          updatedUser.longestStreak,
        lastActivityDate:
          updatedUser.lastActivityDate,
      },
    };
  }

  private async createFirstStreak(
    userId: string,
    today: Date,
    longestStreak: number,
  ) {
    const updatedUser =
      await this.usersService.updateStreak(
        userId,
        {
          CurrentStreak: 1,
          longestStreak: Math.max(
            longestStreak,
            1,
          ),
          lastActivityDate: today,
        },
      );

    return {
      success: true,
      message:
        'İlk günlük seriniz başlatıldı.',
      data: {
        streakIncreased: true,
        streakReset: false,
        previousStreak: 0,
        currentStreak:
          updatedUser.CurrentStreak,
        longestStreak:
          updatedUser.longestStreak,
        lastActivityDate:
          updatedUser.lastActivityDate,
      },
    };
  }

  private hasActivityToday(
    lastActivityDate: Date | null,
  ): boolean {
    if (!lastActivityDate) {
      return false;
    }

    return (
      getDifferenceInUtcDays(
        new Date(),
        lastActivityDate,
      ) === 0
    );
  }
}