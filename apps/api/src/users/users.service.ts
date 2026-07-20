import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateUserData = {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        totalXp: true,
        level: true,
        CurrentStreak: true,
        longestStreak: true,
        hearts: true,
        coins: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findByEmailOrUsername(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
      },
    });
  }
  async findById(id: string) { //refresh token içindeki kullanıcı kimliğine göre kullanıcıyı bulur.
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async updateRefreshTokenHash( //Login sırasında hash kaydeder.Token yenilemede eski hash’i değiştirir.Logout sırasında alanı null yapar.
    userId: string,
    refreshTokenHash: string | null,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
  }
  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        totalXp: true,
        level: true,
        CurrentStreak: true,
        longestStreak: true,
        hearts: true,
        coins: true,
        createdAt: true,
      },
    });
  }
}

//Burada create cevabında passwordHash alanını özellikle döndürmüyoruz çünkü bu alan hassas bir bilgi ve istemciye gönderilmemesi gerekiyor. Bu sayede kullanıcıların şifreleri güvenli bir şekilde saklanabilir ve istemci tarafında ifşa edilmez.