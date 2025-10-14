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

export function roundToDecimals(value: number, decimals = 4): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
