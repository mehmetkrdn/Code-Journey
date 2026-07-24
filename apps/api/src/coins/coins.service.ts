import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';

@Injectable()
export class CoinsService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async getCoins(userId: string) {
    const user =
      await this.usersService.findCoinsByUserId(
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
        coins: user.coins,
      },
    };
  }

  async addCoins(
    userId: string,
    amount: number,
  ) {
    const user =
      await this.usersService.findCoinsByUserId(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    const updatedUser =
      await this.usersService.addCoins(
        userId,
        amount,
      );

    return {
      success: true,
      message: `${amount} jeton başarıyla eklendi.`,
      data: {
        addedCoins: amount,
        previousCoins: user.coins,
        currentCoins: updatedUser.coins,
      },
    };
  }

  async spendCoins(
    userId: string,
    amount: number,
  ) {
    const user =
      await this.usersService.findCoinsByUserId(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı bulunamadı.',
      );
    }

    if (user.coins < amount) {
      throw new BadRequestException(
        'Yeterli jetonunuz bulunmuyor.',
      );
    }

    const updatedUser =
      await this.usersService.spendCoins(
        userId,
        amount,
      );

    if (!updatedUser) {
      throw new BadRequestException(
        'Jeton harcama işlemi gerçekleştirilemedi.',
      );
    }

    return {
      success: true,
      message: `${amount} jeton başarıyla harcandı.`,
      data: {
        spentCoins: amount,
        previousCoins: user.coins,
        currentCoins: updatedUser.coins,
      },
    };
  }
}