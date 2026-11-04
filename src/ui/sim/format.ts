/** t = 3,42 s (Basque decimal comma). */
export function formatSimTime(ms: number): string {
  return `${(ms / 1000).toFixed(2).replace('.', ',')} s`;
}
