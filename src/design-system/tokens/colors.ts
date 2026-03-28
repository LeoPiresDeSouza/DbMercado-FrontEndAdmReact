/**
 * Cores semânticas (hex/rgba). Paridade RN: mesmos valores em tema claro/escuro.
 */
export const colors = {
  bgApp: '#0f1419',
  surface: '#141b2d',
  surfaceElevated: 'rgba(20, 27, 45, 0.95)',
  border: '#2d3748',
  borderSubtle: '#1e293b',
  textPrimary: '#ffffff',
  textSecondary: '#adb5bd',
  textMuted: '#718096',
  accent: '#0d6efd',
  accentHover: '#0b5ed7',
  accentMuted: 'rgba(13, 110, 253, 0.18)',
  danger: '#dc3545',
  success: '#198754',
  warning: '#ffc107',
  focusRing: 'rgba(13, 110, 253, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
