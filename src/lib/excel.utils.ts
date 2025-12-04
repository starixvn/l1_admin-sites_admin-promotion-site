export function sanitizeForExcel(value: string): string {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? `'${value}` : value;
}

