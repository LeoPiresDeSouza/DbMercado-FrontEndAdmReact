/**
 * Sombras CSS (web). Para RN, mapear para preset de `shadow*` / elevation Android
 * (ver comentários por nível).
 */
export const elevation = {
  none: 'none',
  /** RN: shadowOffset {0,1}, opacity ~0.15, radius 2 */
  xs: '0 1px 2px rgba(0, 0, 0, 0.22)',
  /** RN: elevação leve */
  sm: '0 2px 8px rgba(0, 0, 0, 0.28)',
  md: '0 4px 16px rgba(0, 0, 0, 0.32)',
  lg: '0 10px 30px rgba(0, 0, 0, 0.35)',
  xl: '0 18px 48px rgba(0, 0, 0, 0.45)',
} as const;

export type ElevationToken = keyof typeof elevation;
