import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async getProfile(userId: string) {
    const user =
      await this.usersService.findProfileById(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'Kullanıcı profili bulunamadı.',
      );
    }

    return {
      success: true,
      data: {
        user,
      },
    };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ) {
    const currentUser =
      await this.usersService.findById(userId);

    if (!currentUser) {
      throw new NotFoundException(
        'Kullanıcı profili bulunamadı.',
      );
    }

    const updateData: {
      displayName?: string;
      username?: string;
    } = {};

    if (updateProfileDto.displayName !== undefined) {
      updateData.displayName =
        updateProfileDto.displayName.trim();
    }

    if (updateProfileDto.username !== undefined) {
      const normalizedUsername =
        updateProfileDto.username
          .trim()
          .toLowerCase();

      if (
        normalizedUsername !== currentUser.username
      ) {
        const usernameOwner =
          await this.usersService.findByUsername(
            normalizedUsername,
          );

        if (usernameOwner) {
          throw new ConflictException(
            'Bu kullanıcı adı zaten kullanılıyor.',
          );
        }
      }

      updateData.username = normalizedUsername;
    }

    const updatedUser =
      await this.usersService.updateProfile(
        userId,
        updateData,
      );

    return {
      success: true,
      message: 'Profil başarıyla güncellendi.',
      data: {
        user: updatedUser,
      },
    };
  }
}

//Token’dan gelen kullanıcı ID’sini alır.Kullanıcıyı veritabanında arar.Kullanıcı yoksa 404 Not Found döndürür.Kullanıcı varsa güvenli profil bilgilerini döndürür.
//service, veritabanında işlem yapan kısımdır nestjsde.
//nestjsde service, controller ve module üçlüsü ile çalışır. Controller, gelen istekleri alır ve service’e yönlendirir. Service, iş mantığını ve veritabanı işlemlerini gerçekleştirir. Module ise bu bileşenleri bir araya getirir ve bağımlılıkları yönetir.
//Kullanıcının gerçekten var olup olmadığı kontrol edilir.
//Kullanıcı adı başka biri tarafından kullanılıyorsa 409 Conflict döner.
//Kullanıcının profil bilgilerini günceller ve güncellenmiş kullanıcıyı döndürür.
//Hassas bilgiler (şifre gibi) istemciye gönderilmez. Sadece güvenli bilgiler döndürülür