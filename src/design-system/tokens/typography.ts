/**
 * Tipografia semântica. Em RN: `fontFamily` costuma apontar para fonte nativa ou asset;
 * mantemos a mesma escala de tamanho/peso.
 */
export const fontFamily = {
  /** Web: stack CSS; RN: substituir por fonte carregada. */
  sans: "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'Cascadia Code', 'Fira Code', Menlo, monospace",
} as const;

export const fontSize = {
  '2xs': 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export type FontSizeToken = keyof typeof fontSize;

export const lineHeight = {
  tight: 1.2,
  normal: 1.45,
  relaxed: 1.6,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
