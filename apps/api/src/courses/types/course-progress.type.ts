export type CourseLessonProgressItem = {
  id: string;
  title: string;
  slug: string;
  order: number;
  xpReward: number;
  coinReward: number;
  estimatedTime: number | null;

  isCompleted: boolean;
  completedAt: Date | null;

  isLocked: boolean;
  isAvailable: boolean;
};

//kullanıcıya ait ders ilerleme bilgilerini içeren tip
