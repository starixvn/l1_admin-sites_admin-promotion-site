export function getNowInGMT7(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
}

export function generateHourOptions(): string[] {
  return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
}

export function generateMinuteOptions(): string[] {
  return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
}

export function mergeDateAndTime(
  date: Date,
  hour: string,
  minute: string
): Date {
  const newDate = new Date(date);
  newDate.setHours(Number(hour));
  newDate.setMinutes(Number(minute));
  return newDate;
}

export function getTodayAtMidnightGMT7(): Date {
  const now = getNowInGMT7();
  now.setHours(0, 0, 0, 0);
  return now;
}
