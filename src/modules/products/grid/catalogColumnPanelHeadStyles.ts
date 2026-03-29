/**
 * CSS do painel "Colunas" injetado ao final de document.head (sem @layer).
 * O Quartz/Enterprise v35 empacotam tema em @layer; regras em global.css/Tailwind
 * podem não vencer — este bloco garante padding e bordas no catálogo.
 */
import { CATALOG_CHECKBOX_BORDER_RADIUS_PX } from './produtosQuartzTheme';

export const CATALOG_COLUMN_PANEL_HEAD_STYLE_ID = 'dbmercado-catalog-column-panel-css';

export const CATALOG_COLUMN_PANEL_HEAD_CSS = `
/*
 * Checkboxes (painel Colunas/Filtros etc.): ag-grid.css vem SEM @layer; o Quartz injeta o estilo novo DENTRO de @layer.
 * No cascade moderno, regras fora de layer vencem as de dentro → os ::before/::after antigos (ícone em fonte) ficam por cima
 * e o tema “preenchido + tique branco” quase não aparece. Este bloco (sem @layer) repete o modelo mascarado só no host do catálogo.
 *
 * Raio: em ag-grid.css, [class*=ag-theme-] fixa --ag-border-radius: 0px e --ag-checkbox-border-radius: var(--ag-border-radius),
 * então --ag-checkbox-border-radius fica 0 — var(..., 8px) NÃO usa o fallback. Corrigimos variável nos filhos do host e px explícitos abaixo.
 */
#dbmercado-produtos-grid-host.produtos-grid-host--erp [class*='ag-theme-'] {
  --ag-checkbox-border-radius: ${CATALOG_CHECKBOX_BORDER_RADIUS_PX}px !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper {
  box-sizing: border-box !important;
  position: relative !important;
  display: inline-block !important;
  width: var(--ag-icon-size) !important;
  height: var(--ag-icon-size) !important;
  flex: none !important;
  vertical-align: middle !important;
  /* hidden: recorta o ::after (máscara do tique) aos cantos; "visible" deixava tudo visualmente quadrado. */
  overflow: hidden !important;
  border-radius: ${CATALOG_CHECKBOX_BORDER_RADIUS_PX}px !important;
  clip-path: inset(0 round ${CATALOG_CHECKBOX_BORDER_RADIUS_PX}px) !important;
  border: solid var(--ag-checkbox-border-width) var(--ag-checkbox-unchecked-border-color) !important;
  background-color: var(--ag-checkbox-unchecked-background-color) !important;
  font-size: 0 !important;
  line-height: 0 !important;
  -webkit-font-smoothing: initial !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper.ag-checked {
  background-color: var(--ag-checkbox-checked-background-color) !important;
  border-color: var(--ag-checkbox-checked-border-color) !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper.ag-indeterminate {
  background-color: var(--ag-checkbox-indeterminate-background-color) !important;
  border-color: var(--ag-checkbox-indeterminate-border-color) !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper::before {
  content: none !important;
  display: none !important;
  background: none !important;
  background-image: none !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  display: block !important;
  pointer-events: none !important;
  border-radius: ${CATALOG_CHECKBOX_BORDER_RADIUS_PX}px !important;
  mask-position: center !important;
  mask-repeat: no-repeat !important;
  -webkit-mask-position: center !important;
  -webkit-mask-repeat: no-repeat !important;
  mask-size: contain !important;
  -webkit-mask-size: contain !important;
  background-color: transparent !important;
  background-image: none !important;
  mask-image: none !important;
  -webkit-mask-image: none !important;
  font-family: inherit !important;
  color: transparent !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper.ag-checked::after {
  background-color: var(--ag-checkbox-checked-shape-color) !important;
  -webkit-mask-image: var(--ag-checkbox-checked-shape-image) !important;
  mask-image: var(--ag-checkbox-checked-shape-image) !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-checkbox-input-wrapper.ag-indeterminate::after {
  background-color: var(--ag-checkbox-indeterminate-shape-color) !important;
  -webkit-mask-image: var(--ag-checkbox-indeterminate-shape-image) !important;
  mask-image: var(--ag-checkbox-indeterminate-shape-image) !important;
}

/*
 * Linhas no .ag-pivot-mode-panel: topo e base via inset box-shadow (o tema aplica border:none e anula border-*).
 */
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-column-panel .ag-pivot-mode-panel {
  border: none !important;
  box-shadow:
    inset 0 1px 0 0 #e2e8f0,
    inset 0 -1px 0 0 #e2e8f0 !important;
}
#dbmercado-produtos-grid-host .ag-column-panel .ag-column-select.ag-column-panel-column-select {
  box-sizing: border-box !important;
  padding-top: 21px !important;
  padding-top: calc(var(--ag-grid-size, 7px) * 3) !important;
  border-top: none !important;
  border-top-width: 0 !important;
  border-bottom: none !important;
}
#dbmercado-produtos-grid-host .ag-column-select-header {
  border-bottom: none !important;
  padding-block: 6px 0 !important;
  min-height: unset !important;
  height: auto !important;
}
#dbmercado-produtos-grid-host .ag-column-select-header-filter-wrapper .ag-input-wrapper {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp ag-input-text-field.ag-column-select-header-filter-wrapper,
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-column-select-header-filter-wrapper.ag-input-field {
  flex: 1 1 0% !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
}
/*
 * Só longhand: um border: none vindo do Quartz depois anula o shorthand border: 1px inteiro no DevTools.
 */
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-column-select-header-filter-wrapper .ag-text-field-input,
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-column-select-header-filter-wrapper .ag-input-field-input {
  border-top: 1px solid color-mix(in srgb, var(--ag-border-color, #94a3b8), transparent 45%) !important;
  border-left: 1px solid color-mix(in srgb, var(--ag-border-color, #94a3b8), transparent 45%) !important;
  border-right: 1px solid color-mix(in srgb, var(--ag-border-color, #94a3b8), transparent 45%) !important;
  border-bottom: none !important;
  border-radius: 10px !important;
  background-color: var(--ag-background-color, #fff) !important;
  min-height: 34px !important;
  padding-inline-start: 32px !important;
  padding-inline-end: 12px !important;
}
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-column-select-header-filter-wrapper .ag-text-field-input:focus,
#dbmercado-produtos-grid-host.produtos-grid-host--erp .ag-column-select-header-filter-wrapper .ag-input-field-input:focus {
  outline: none !important;
  border-top-color: var(--ag-active-color, #0091ff) !important;
  border-left-color: var(--ag-active-color, #0091ff) !important;
  border-right-color: var(--ag-active-color, #0091ff) !important;
  border-bottom: none !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ag-active-color, #0091ff), transparent 80%) !important;
}
`;
