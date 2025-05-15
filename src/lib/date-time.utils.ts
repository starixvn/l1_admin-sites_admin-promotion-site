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

export function toGMTString(dateStr: string, gmtOffset: number): string {
  if (!dateStr) {
    return "";
  }
  const date = new Date(dateStr);
  const gmtDate = new Date(date.getTime() + gmtOffset * 60 * 60 * 1000);
  return gmtDate
    .toLocaleString("en-GB", {
      timeZone: "UTC",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
}
