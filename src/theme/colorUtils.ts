// src/theme/colorUtils.ts
// Единая замена ручным rgba(r,g,b,a)-литералам и конкатенации `${hex}NN` —
// оба соглашения существовали параллельно до централизации цветовой системы.

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
