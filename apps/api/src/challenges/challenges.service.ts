import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  /*
   * Bir derse ait challenge'ları getirir.
   *
   * correctAnswer ve explanation burada
   * kullanıcıya gönderilmez.
   */
  async findByLesson(lessonId: string) {
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
      },
    });

    if (!lesson) {
      throw new NotFoundException('Ders bulunamadı veya yayınlanmadı.');
    }

    return this.prisma.challenge.findMany({
      where: {
        lessonId,
        isPublished: true,
      },

      orderBy: {
        order: 'asc',
      },

      select: {
        id: true,
        type: true,
        question: true,
        description: true,
        codeSnippet: true,
        order: true,
        xpReward: true,
        coinReward: true,

        options: {
          orderBy: {
            order: 'asc',
          },

          select: {
            id: true,
            text: true,
            order: true,
          },
        },
      },
    });
  }

  /*
   * Challenge cevabını kontrol eder.
   *
   * Şimdilik:
   *
   * MULTIPLE_CHOICE
   * FILL_IN_THE_BLANK
   *
   * türlerini destekliyoruz.
   */
  private checkAnswer(
    type: string,
    correctAnswer: unknown,
    submittedAnswer: Record<string, unknown>,
  ): boolean {
    if (typeof correctAnswer !== 'object' || correctAnswer === null) {
      return false;
    }

    const correct = correctAnswer as Record<string, unknown>;

    switch (type) {
      // =========================================
      // MULTIPLE CHOICE
      // =========================================

      case 'MULTIPLE_CHOICE': {
        const submitted = submittedAnswer.answer;

        const answer = correct.answer;

        if (typeof submitted !== 'string' || typeof answer !== 'string') {
          return false;
        }

        return submitted.trim().toLowerCase() === answer.trim().toLowerCase();
      }

      // =========================================
      // FILL IN THE BLANK
      // =========================================

      case 'FILL_IN_THE_BLANK': {
        const submitted = submittedAnswer.answer;

        const acceptedAnswers = correct.acceptedAnswers;

        if (typeof submitted !== 'string' || !Array.isArray(acceptedAnswers)) {
          return false;
        }

        const normalizedSubmitted = submitted.trim().toLowerCase();

        return acceptedAnswers.some(
          (answer) =>
            typeof answer === 'string' &&
            answer.trim().toLowerCase() === normalizedSubmitted,
        );
      }

      // =========================================
      // ORDER CODE
      // =========================================

      case 'ORDER_CODE': {
        const submittedOrder = submittedAnswer.order;

        const correctOrder = correct.order;

        if (!Array.isArray(submittedOrder) || !Array.isArray(correctOrder)) {
          return false;
        }

        if (submittedOrder.length !== correctOrder.length) {
          return false;
        }

        return correctOrder.every((line, index) => {
          const submittedLine = submittedOrder[index];

          if (typeof line !== 'string' || typeof submittedLine !== 'string') {
            return false;
          }

          return line.trim() === submittedLine.trim();
        });
      }

      // =========================================
      // FIND BUG
      // =========================================

      case 'FIND_BUG': {
        const submitted = submittedAnswer.answer;

        const acceptedAnswers = correct.acceptedAnswers;

        if (typeof submitted !== 'string' || !Array.isArray(acceptedAnswers)) {
          return false;
        }

        const normalizedSubmitted = submitted
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase();

        return acceptedAnswers.some(
          (answer) =>
            typeof answer === 'string' &&
            answer.trim().replace(/\s+/g, ' ').toLowerCase() ===
              normalizedSubmitted,
        );
      }

      // =========================================
      // OUTPUT PREDICTION
      // =========================================

      case 'OUTPUT_PREDICTION': {
        const submitted = submittedAnswer.answer;

        const acceptedAnswers = correct.acceptedAnswers;

        if (typeof submitted !== 'string' || !Array.isArray(acceptedAnswers)) {
          return false;
        }

        const normalizedSubmitted = submitted
          .trim()
          .replace(/\r\n/g, '\n')
          .toLowerCase();

        return acceptedAnswers.some(
          (answer) =>
            typeof answer === 'string' &&
            answer.trim().replace(/\r\n/g, '\n').toLowerCase() ===
              normalizedSubmitted,
        );
      }

      default:
        return false;
    }
  }

  /*
   * Kullanıcının challenge cevabını işler.
   */
  async submitAnswer(
    userId: string,
    challengeId: string,
    submittedAnswer: Record<string, unknown>,
  ) {
    /*
     * Challenge'ı ve doğru cevabı backend
     * içerisinde alıyoruz.
     *
     * correctAnswer buradan kullanıcıya
     * doğrudan dönmeyecek.
     */
    const challenge = await this.prisma.challenge.findFirst({
      where: {
        id: challengeId,
        isPublished: true,

        lesson: {
          isPublished: true,

          section: {
            isPublished: true,

            course: {
              isPublished: true,
            },
          },
        },
      },

      select: {
        id: true,
        type: true,
        correctAnswer: true,
        explanation: true,
        xpReward: true,
        coinReward: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge bulunamadı veya yayınlanmadı.');
    }

    /*
     * Cevabı kontrol ediyoruz.
     */
    const isCorrect = this.checkAnswer(
      challenge.type,
      challenge.correctAnswer,
      submittedAnswer,
    );

    /*
     * Attempt oluşturma ve ödül verme
     * aynı transaction içerisinde yapılır.
     */
    const result = await this.prisma.$transaction(async (tx) => {
      /*
       * Kullanıcı bu challenge'ı daha önce
       * doğru cevaplamış mı?
       */
      const previousCorrectAttempt = await tx.userChallengeAttempt.findFirst({
        where: {
          userId,
          challengeId,
          isCorrect: true,
        },

        select: {
          id: true,
        },
      });

      /*
       * Ödül yalnızca:
       *
       * - cevap doğruysa
       * - daha önce doğru cevap yoksa
       *
       * verilecek.
       */
      const shouldReward = isCorrect && !previousCorrectAttempt;

      /*
       * Her cevap denemesi kaydedilir.
       */
      const attempt = await tx.userChallengeAttempt.create({
        data: {
          userId,
          challengeId,

          submittedAnswer: submittedAnswer as Prisma.InputJsonValue,

          isCorrect,

          earnedXp: shouldReward ? challenge.xpReward : 0,

          earnedCoins: shouldReward ? challenge.coinReward : 0,
        },

        select: {
          id: true,
          isCorrect: true,
          earnedXp: true,
          earnedCoins: true,
          createdAt: true,
        },
      });

      let user: {
        id: string;
        totalXp: number;
        level: number;
        coins: number;
      } | null = null;

      /*
       * İlk doğru cevapsa
       * XP ve coin ekliyoruz.
       */
      if (shouldReward) {
        const rewardedUser = await tx.user.update({
          where: {
            id: userId,
          },

          data: {
            totalXp: {
              increment: challenge.xpReward,
            },

            coins: {
              increment: challenge.coinReward,
            },
          },

          select: {
            id: true,
            totalXp: true,
            level: true,
            coins: true,
          },
        });

        /*
         * Mevcut progression sistemimizde
         * her 100 XP = yeni level.
         *
         * 0-99   = Level 1
         * 100-199 = Level 2
         * ...
         */
        const calculatedLevel = Math.floor(rewardedUser.totalXp / 100) + 1;

        /*
         * Level değiştiyse DB'de güncelle.
         */
        if (rewardedUser.level !== calculatedLevel) {
          user = await tx.user.update({
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
        } else {
          user = rewardedUser;
        }
      }

      return {
        attempt,
        shouldReward,
        user,

        alreadySolved: Boolean(previousCorrectAttempt),
      };
    });

    /*
     * Kullanıcıya dönecek response.
     */
    return {
      success: true,

      message: isCorrect ? 'Doğru cevap!' : 'Yanlış cevap.',

      data: {
        challengeId: challenge.id,

        isCorrect,

        /*
         * Explanation ancak cevap gönderildikten
         * sonra burada gösteriliyor.
         */
        explanation: challenge.explanation,

        rewardGranted: result.shouldReward,

        alreadySolved: result.alreadySolved,

        rewards: {
          xp: result.attempt.earnedXp,

          coins: result.attempt.earnedCoins,
        },

        attempt: {
          id: result.attempt.id,

          createdAt: result.attempt.createdAt,
        },

        user: result.user,
      },
    };
  }

  async getProgress(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findFirst({
      where: {
        id: challengeId,
        isPublished: true,

        lesson: {
          isPublished: true,

          section: {
            isPublished: true,

            course: {
              isPublished: true,
            },
          },
        },
      },

      select: {
        id: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge bulunamadı veya yayınlanmadı.');
    }

    const attempts = await this.prisma.userChallengeAttempt.findMany({
      where: {
        userId,
        challengeId,
      },

      orderBy: {
        createdAt: 'asc',
      },

      select: {
        id: true,
        isCorrect: true,
        earnedXp: true,
        earnedCoins: true,
        createdAt: true,
      },
    });

    const correctAttempts = attempts.filter((attempt) => attempt.isCorrect);

    const firstCorrectAttempt = correctAttempts[0];

    const earnedXp = attempts.reduce(
      (total, attempt) => total + attempt.earnedXp,
      0,
    );

    const earnedCoins = attempts.reduce(
      (total, attempt) => total + attempt.earnedCoins,
      0,
    );

    return {
      challengeId,

      isCompleted: correctAttempts.length > 0,

      hasCorrectAttempt: correctAttempts.length > 0,

      attemptCount: attempts.length,

      correctAttemptCount: correctAttempts.length,

      firstCompletedAt: firstCorrectAttempt?.createdAt ?? null,

      earnedXp,

      earnedCoins,
    };
  }

  async getLessonChallengeProgress(userId: string, lessonId: string) {
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

        challenges: {
          where: {
            isPublished: true,
          },

          orderBy: {
            order: 'asc',
          },

          select: {
            id: true,
            type: true,
            question: true,
            order: true,
            xpReward: true,
            coinReward: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Ders bulunamadı veya yayınlanmadı.');
    }

    const challengeIds = lesson.challenges.map((challenge) => challenge.id);

    const attempts =
      challengeIds.length > 0
        ? await this.prisma.userChallengeAttempt.findMany({
            where: {
              userId,

              challengeId: {
                in: challengeIds,
              },
            },

            orderBy: {
              createdAt: 'asc',
            },

            select: {
              id: true,
              challengeId: true,
              isCorrect: true,
              earnedXp: true,
              earnedCoins: true,
              createdAt: true,
            },
          })
        : [];

    const challenges = lesson.challenges.map((challenge) => {
      const challengeAttempts = attempts.filter(
        (attempt) => attempt.challengeId === challenge.id,
      );

      const correctAttempts = challengeAttempts.filter(
        (attempt) => attempt.isCorrect,
      );

      const firstCorrectAttempt = correctAttempts[0];

      const earnedXp = challengeAttempts.reduce(
        (total, attempt) => total + attempt.earnedXp,
        0,
      );

      const earnedCoins = challengeAttempts.reduce(
        (total, attempt) => total + attempt.earnedCoins,
        0,
      );

      return {
        id: challenge.id,
        type: challenge.type,
        question: challenge.question,
        order: challenge.order,

        isCompleted: correctAttempts.length > 0,

        attemptCount: challengeAttempts.length,

        correctAttemptCount: correctAttempts.length,

        firstCompletedAt: firstCorrectAttempt?.createdAt ?? null,

        earnedXp,
        earnedCoins,
      };
    });

    const totalChallenges = challenges.length;

    const completedChallenges = challenges.filter(
      (challenge) => challenge.isCompleted,
    ).length;

    const remainingChallenges = totalChallenges - completedChallenges;

    const progressPercentage =
      totalChallenges === 0
        ? 0
        : Math.round((completedChallenges / totalChallenges) * 100);

    const isCompleted =
      totalChallenges > 0 && completedChallenges === totalChallenges;

    return {
      lesson: {
        id: lesson.id,
        title: lesson.title,
      },

      totalChallenges,
      completedChallenges,
      remainingChallenges,
      progressPercentage,
      isCompleted,

      challenges,
    };
  }
}

/*
Buradaki kritik güvenlik noktası şunları select içine koymadık: correctAnswer,explanation

Özellikle: correctAnswer frontend'e kesinlikle gönderilmemeli.

Yoksa mobil uygulama: GET /api/challenges/123 isteği yaptığında doğru cevap da JSON içerisinde kullanıcıya gider.

Yani veritabanında: correctAnswer → Backend bilir

API'de:correctAnswer → Kullanıcı görmez olacak. 
explanation ise kullanıcı cevap verdikten sonra gösterilecek.


Burada şu işlemler tamamlandı:
Challenge listeleme
↓
correctAnswer gizli

Cevap gönderme
↓
Doğru / yanlış kontrolü
↓
Attempt kaydı
↓
İlk doğru cevap mı?
↓
Evet → XP + Coin
Hayır → Ödül yok


Lesson
↓
Published challenge'ları bul
↓
Kullanıcının attempt kayıtlarını getir
↓
Her challenge çözüldü mü?
↓
Toplam tamamlanma oranını hesapla


Kod gösterilir
      ↓
"Kodun çıktısı nedir?"
      ↓
Kullanıcı çıktı yazar
      ↓
Backend acceptedAnswers ile karşılaştırır

*/
