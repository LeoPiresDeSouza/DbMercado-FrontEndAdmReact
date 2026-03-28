/**
 * Escala de espaçamento (px). Paridade RN: usar os mesmos números em `StyleSheet` / Tamagui.
 * Pacote futuro: `@dbmercado/design-tokens` pode exportar só este módulo.
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export type SpacingToken = keyof typeof spacing;

export function spacingPx(token: SpacingToken): number {
  return spacing[token];
}
