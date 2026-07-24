export function getUtcDayStart(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

export function getDifferenceInUtcDays(
  newerDate: Date,
  olderDate: Date,
): number {
  const newerDay = getUtcDayStart(newerDate);
  const olderDay = getUtcDayStart(olderDate);

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return Math.floor(
    (newerDay.getTime() - olderDay.getTime()) /
      millisecondsPerDay,
  );
}

//Fonksiyon saatleri yok sayarak yalnızca gün farkını hesaplar.