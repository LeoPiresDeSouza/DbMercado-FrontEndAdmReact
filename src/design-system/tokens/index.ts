/**
 * Design tokens portáveis (sem dependência de React/DOM).
 * Extração futura: publicar pasta `tokens/` como `@dbmercado/design-tokens`.
 *
 * Paridade React Native: consumir estes objetos em tema RN; espelhar valores em `tokens.css` só no web.
 */
import { breakpoints } from './breakpoints';
import { colors } from './colors';
import { elevation } from './elevation';
import { fontFamily, fontSize, fontWeight, lineHeight } from './typography';
import { radius } from './radius';
import { spacing } from './spacing';

export { breakpoints, type BreakpointToken } from './breakpoints';
export { colors, type ColorToken } from './colors';
export { elevation, type ElevationToken } from './elevation';
export { fontFamily, fontSize, fontWeight, lineHeight, type FontSizeToken } from './typography';
export { radius, type RadiusToken } from './radius';
export { spacing, spacingPx, type SpacingToken } from './spacing';

export const designTokens = {
  breakpoints,
  colors,
  elevation,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  spacing,
} as const;
