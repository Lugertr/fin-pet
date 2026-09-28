// src/theme/colorUtils.ts
// Единая замена ручным rgba(r,g,b,a)-литералам и конкатенации `${hex}NN` —
// оба соглашения существовали параллельно до централизации цветовой системы.

/** Светлый ли цвет (относительная яркость по WCAG > 0.6) — чтобы значок
 * поверх него рисовать тёмным, а не белым. */
export function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.substring(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
}

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
