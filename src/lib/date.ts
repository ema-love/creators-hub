/** Whole days from today until an ISO date (local time). Negative once passed. */
export function daysUntil(iso: string, now = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
