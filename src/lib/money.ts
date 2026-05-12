/** DB `amountCents` holds whole KRW (won), not fractional dollars. */

/** Parse user-entered won (optional thousands commas). Returns null if invalid. */
export function parseWonInput(input: string): number | null {
  const t = input.trim().replace(/,/g, "");
  if (!/^\d+$/.test(t)) return null;
  const w = Number(t);
  if (!Number.isFinite(w) || w <= 0) return null;
  return w;
}

export function formatWon(won: number, currency = "KRW"): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(won);
}
