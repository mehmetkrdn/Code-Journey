import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        icon: true,
        order: true,
        createdAt: true,

        sections: {
          where: {
            isPublished: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        icon: true,
        order: true,
        createdAt: true,
        updatedAt: true,

        sections: {
          where: {
            isPublished: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,

            lessons: {
              where: {
                isPublished: true,
              },
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                order: true,
                xpReward: true,
                coinReward: true,
                estimatedTime: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs bulunamadı veya henüz yayınlanmadı.');
    }

    return course;
  }

  async getCourseProgress(
    /*Önce yayınlanmış kursu, bölümleri ve dersleri getiriyoruz. Her ders için yalnızca giriş yapan kullanıcının ilerlemesini alıyoruz:
    Daha sonra bütün dersleri gerçek kurs sırasına göre tek listeye çeviriyoruz. Bunun amacı bir bölümün son dersi ile sonraki bölümün ilk dersi arasında da kilit ilişkisi kurmaktır. */
    slug: string,
    userId: string,
  ) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        icon: true,

        sections: {
          where: {
            isPublished: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,

            lessons: {
              where: {
                isPublished: true,
              },
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                order: true,
                xpReward: true,
                coinReward: true,
                estimatedTime: true,

                userProgress: {
                  where: {
                    userId,
                  },
                  select: {
                    isCompleted: true,
                    completedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs bulunamadı veya henüz yayınlanmadı.');
    }

    const orderedLessons = course.sections.flatMap((section) =>
      section.lessons.map((lesson) => ({
        sectionId: section.id,
        lessonId: lesson.id,
      })),
    );

    const lessonPositionMap = new Map(
      orderedLessons.map((lesson, index) => [lesson.lessonId, index]),
    );

    const completedLessonIds = new Set(
      course.sections.flatMap((section) =>
        section.lessons
          .filter((lesson) => lesson.userProgress[0]?.isCompleted === true)
          .map((lesson) => lesson.id),
      ),
    );

    const sections = course.sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      order: section.order,

      lessons: section.lessons.map((lesson) => {
        const position = lessonPositionMap.get(lesson.id) ?? 0;

        const previousLesson =
          position > 0 ? orderedLessons[position - 1] : null;

        const isCompleted = lesson.userProgress[0]?.isCompleted ?? false;

        const previousLessonCompleted = previousLesson
          ? completedLessonIds.has(previousLesson.lessonId)
          : true;

        const isAvailable =
          position === 0 || isCompleted || previousLessonCompleted;

        return {
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          order: lesson.order,
          xpReward: lesson.xpReward,
          coinReward: lesson.coinReward,
          estimatedTime: lesson.estimatedTime,

          isCompleted,
          completedAt: lesson.userProgress[0]?.completedAt ?? null,

          isLocked: !isAvailable,
          isAvailable,
        };
      }),
    }));

    const totalLessons = orderedLessons.length;
    const completedLessons = completedLessonIds.size;

    const progressPercentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    const nextLesson =
      sections
        .flatMap((section) =>
          section.lessons.map((lesson) => ({
            ...lesson,
            sectionId: section.id,
            sectionTitle: section.title,
          })),
        )
        .find((lesson) => lesson.isAvailable && !lesson.isCompleted) ?? null;

    return {
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          icon: course.icon,
        },

        progress: {
          totalLessons,
          completedLessons,
          remainingLessons: totalLessons - completedLessons,
          progressPercentage,
          isCompleted: totalLessons > 0 && completedLessons === totalLessons,
        },

        nextLesson,

        sections,
      },
    };
  }
}
