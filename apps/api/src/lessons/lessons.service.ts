import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  calculateLevel,
  getLevelProgress,
} from '../progression/utils/level-calculator';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isPublished: true,
        section: {
          isPublished: true,
          course: {
            isPublished: true,
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        content: true,
        order: true,
        xpReward: true,
        coinReward: true,
        estimatedTime: true,
        createdAt: true,
        updatedAt: true,

        section: {
          select: {
            id: true,
            title: true,
            order: true,

            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Ders bulunamadı veya henüz yayınlanmadı.');
    }

    return {
      success: true,
      data: {
        lesson,
      },
    };
  }

  async getProgress(userId: string, lessonId: string) {
    const lesson = await this.findPublishedLesson(lessonId);

    const progress = await this.prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      select: {
        id: true,
        isCompleted: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const availability = await this.checkLessonAvailability(userId, lessonId);

    return {
      success: true,
      data: {
        lesson: {
          id: lesson.id,
          title: lesson.title,
        },
        progress: {
          isStarted: Boolean(progress),
          isCompleted: progress?.isCompleted ?? false,
          completedAt: progress?.completedAt ?? null,
          isLocked: !availability.isAvailable,
          isAvailable: availability.isAvailable,
          previousLessonId: availability.previousLessonId,
        },
      },
    };
  }

  async completeLesson(userId: string, lessonId: string) {
    const availability = await this.checkLessonAvailability(userId, lessonId);

    if (!availability.isAvailable) {
      throw new ForbiddenException(
        'Bu ders henüz açılmadı. Önce önceki dersi tamamlamalısınız.',
      );
    }
    const result = await this.prisma.$transaction(async (transaction) => {
      const lesson = await transaction.lesson.findFirst({
        where: {
          id: lessonId,
          isPublished: true,
          section: {
            isPublished: true,
            course: {
              isPublished: true,
            },
          },
        },
        select: {
          id: true,
          title: true,
          xpReward: true,
          coinReward: true,
        },
      });

      if (!lesson) {
        throw new NotFoundException('Ders bulunamadı veya henüz yayınlanmadı.');
      }

      const existingProgress = await transaction.userLessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        select: {
          id: true,
          isCompleted: true,
          completedAt: true,
        },
      });

      if (existingProgress?.isCompleted) {
        return {
          alreadyCompleted: true,
          lesson,
          progress: existingProgress,
          user: null,
        };
      }

      const completedAt = new Date();

      /*
       * Önce ilerleme kaydını oluşturuyoruz veya
       * mevcut kaydı tamamlandı olarak güncelliyoruz.
       */
      const progress = existingProgress
        ? await transaction.userLessonProgress.update({
            where: {
              id: existingProgress.id,
            },
            data: {
              isCompleted: true,
              completedAt,
            },
            select: {
              id: true,
              isCompleted: true,
              completedAt: true,
            },
          })
        : await transaction.userLessonProgress.create({
            data: {
              userId,
              lessonId,
              isCompleted: true,
              completedAt,
            },
            select: {
              id: true,
              isCompleted: true,
              completedAt: true,
            },
          });

      /*
       * XP ve coin yalnızca ders ilk defa
       * tamamlandığında artırılır.
       */
      const rewardedUser = await transaction.user.update({
        where: {
          id: userId,
        },
        data: {
          totalXp: {
            increment: lesson.xpReward,
          },
          coins: {
            increment: lesson.coinReward,
          },
        },
        select: {
          id: true,
          totalXp: true,
          level: true,
          coins: true,
        },
      });

      const calculatedLevel = calculateLevel(rewardedUser.totalXp);

      const updatedUser =
        rewardedUser.level === calculatedLevel
          ? rewardedUser
          : await transaction.user.update({
              where: {
                id: userId,
              },
              data: {
                level: calculatedLevel,
              },
              select: {
                id: true,
                totalXp: true,
                level: true,
                coins: true,
              },
            });

      return {
        alreadyCompleted: false,
        lesson,
        progress,
        user: updatedUser,
      };
    });

    if (result.alreadyCompleted) {
      return {
        success: true,
        message: 'Bu ders daha önce tamamlandı. Tekrar ödül verilmedi.',
        data: {
          alreadyCompleted: true,
          rewardGranted: false,
          lesson: {
            id: result.lesson.id,
            title: result.lesson.title,
          },
          progress: result.progress,
        },
      };
    }

    if (!result.user) {
      throw new Error('Ders ödüllendirme sonucu oluşturulamadı.');
    }

    return {
      success: true,
      message: 'Ders başarıyla tamamlandı.',
      data: {
        alreadyCompleted: false,
        rewardGranted: true,

        lesson: {
          id: result.lesson.id,
          title: result.lesson.title,
        },

        rewards: {
          xp: result.lesson.xpReward,
          coins: result.lesson.coinReward,
        },

        progress: result.progress,

        user: {
          totalXp: result.user.totalXp,
          level: result.user.level,
          coins: result.user.coins,
        },

        levelProgress: getLevelProgress(result.user.totalXp),
      },
    };
  }

  private async findPublishedLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isPublished: true,
        section: {
          isPublished: true,
          course: {
            isPublished: true,
          },
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Ders bulunamadı veya henüz yayınlanmadı.');
    }

    return lesson;
  }
  private async checkLessonAvailability(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        isPublished: true,
        section: {
          isPublished: true,
          course: {
            isPublished: true,
          },
        },
      },
      select: {
        id: true,
        order: true,
        sectionId: true,

        section: {
          select: {
            id: true,
            order: true,
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Ders bulunamadı veya henüz yayınlanmadı.');
    }

    const courseLessons = await this.prisma.lesson.findMany({
      where: {
        isPublished: true,
        section: {
          isPublished: true,
          courseId: lesson.section.courseId,
        },
      },
      orderBy: [
        {
          section: {
            order: 'asc',
          },
        },
        {
          order: 'asc',
        },
      ],
      select: {
        id: true,

        userProgress: {
          where: {
            userId,
          },
          select: {
            isCompleted: true,
          },
        },
      },
    });

    const currentLessonIndex = courseLessons.findIndex(
      (courseLesson) => courseLesson.id === lessonId,
    );

    if (currentLessonIndex === -1) {
      throw new NotFoundException('Ders kurs içerisinde bulunamadı.');
    }

    if (currentLessonIndex === 0) {
      return {
        isAvailable: true,
        previousLessonId: null,
      };
    }

    const currentProgress = courseLessons[currentLessonIndex].userProgress[0];

    if (currentProgress?.isCompleted) {
      return {
        isAvailable: true,
        previousLessonId: courseLessons[currentLessonIndex - 1].id,
      };
    }

    const previousLesson = courseLessons[currentLessonIndex - 1];

    const previousLessonCompleted =
      previousLesson.userProgress[0]?.isCompleted ?? false;

    return {
      isAvailable: previousLessonCompleted,
      previousLessonId: previousLesson.id,
    };
  }
}

/*
findById() yayınlanmış dersin içeriğini getirir. Dersin bağlı olduğu bölüm veya kurs yayında değilse ders de kullanıcıya gösterilmez.

getProgress() şu birleşik unique alanı kullanır:

userId_lessonId

Bu alan Prisma modelindeki şu kurala karşılık gelir:

@@unique([userId, lessonId])

Prisma, birleşik unique constraint’lerin findUnique, update, delete ve upsert gibi unique sorgularda kullanılmasını destekler.

completeLesson() işlemi ise aynı transaction içinde:

İlerleme kaydını oluşturur
↓
XP ekler
↓
Coin ekler
↓
Level hesaplar

Bu işlemlerden biri başarısız olursa transaction’ın tamamı geri alınır.

private async ChecklessonAvailability metotu ilk ders olup olmadığını, Önceki dersin tamamlanıp tamamlanmadığını, 
Mevcut dersin zaten tamamlanmış olup olmadığını kontrol eder.
*/
