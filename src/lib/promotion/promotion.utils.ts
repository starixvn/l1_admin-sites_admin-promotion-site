export function parseSiteInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
