import { createPart, themeQuartz } from 'ag-grid-community';

/**
 * Quartz afinado para o catálogo ERP: checkboxes com raio, acento azul, separadores de coluna/linha discretos,
 * painel lateral um pouco mais largo (alinhado a referências “premium” do AG Grid).
 */
const catalogAccent = '#0091ff';

/** Altura do header: mesma da prop `headerHeight` do grid — pivot / painel de colunas usam `var(--ag-header-height)` do tema injetado. */
export const CATALOG_GRID_HEADER_PX = 44;

/** Largura padrão do painel lateral Colunas/Filtros (alinhado ao exemplo premium do AG Grid). */
export const CATALOG_SIDEBAR_PANEL_PX = 480;

/**
 * Raio dos checkboxes no catálogo (px). Ícone ~14–16px: raio ≥ metade do lado vira círculo; 3px deixa quadrado só levemente chanfrado.
 * O ag-grid.css zera `--ag-checkbox-border-radius` em `[class*=ag-theme-]`; o head CSS injetado usa este valor em px.
 */
export const CATALOG_CHECKBOX_BORDER_RADIUS_PX = 3;

/**
 * Estilos do painel “Colunas” injetados pelo Theming API (`createPart`), no mesmo `<style>`/camada do Quartz.
 * O CSS em `global.css` por vezes não compete com o injetado no `document.head` (ordem/@layer); aqui o efeito é garantido.
 */
const produtosCatalogoColumnPanelPart = createPart({
  feature: 'dbmercado-catalog-colunas-panel',
  css: () => `
.ag-side-bar,
.ag-tool-panel-content,
.ag-column-panel {
  min-width: 0 !important;
}

.ag-tool-panel-wrapper {
  flex-shrink: 0 !important;
  min-width: var(--ag-side-bar-panel-width, ${CATALOG_SIDEBAR_PANEL_PX}px) !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

/*
 * Sem padding-top: qualquer offset aqui desalinha o painel em relação à coluna das abas (Colunas/Filtros) e ao header do grid.
 * Mantém só a limpeza da borda inferior do conteúdo para não duplicar linha com a paginação.
 */
.ag-tool-panel-wrapper .ag-tool-panel-content {
  padding-top: 0 !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.ag-column-panel {
  border-bottom: none !important;
  box-shadow: none !important;
}

.ag-column-select-header {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 12px !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: var(--ag-header-height) !important;
  box-sizing: border-box !important;
  border: none !important;
  border-bottom: none !important;
  padding-block: 6px 0 !important;
  background-color: var(--ag-control-panel-background-color) !important;
}

.ag-column-select-header:focus-visible::after {
  display: none !important;
}

.ag-column-select-header > * {
  margin-inline: 0 !important;
  margin-block: 0 !important;
}

.ag-column-select-header-icon {
  flex: 0 0 auto !important;
}

.ag-column-select-header-checkbox {
  flex: 0 0 auto !important;
  display: flex !important;
  align-items: center !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.ag-column-select-header-checkbox .ag-checkbox-input-wrapper {
  outline: none !important;
}

.ag-column-select-header-checkbox:focus-visible {
  outline: none !important;
}

/*
 * Faixa Modo pivot: separadores topo/base com box-shadow inset (border-* costuma ser zerado pelo Quartz).
 */
.ag-side-bar .ag-column-panel .ag-pivot-mode-panel {
  border: none !important;
  box-shadow:
    inset 0 1px 0 0 #2d3748,
    inset 0 -1px 0 0 #2d3748 !important;
}

.ag-column-select {
  min-width: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

/*
 * Menos “grades” na lista de colunas: itens usam altura + hover; divisórias fortes somam com header/pivot.
 */
.ag-column-select-list .ag-column-select-virtual-list-item {
  border-top: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.ag-column-select .ag-column-select-column,
.ag-column-select .ag-column-select-column-group {
  border-bottom: none !important;
  box-shadow: none !important;
}

ag-input-text-field.ag-column-select-header-filter-wrapper,
.ag-column-select-header-filter-wrapper.ag-input-field {
  display: flex !important;
  flex: 1 1 0% !important;
  width: auto !important;
  min-width: 0 !important;
  align-self: center !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  margin-inline: 0 !important;
}

ag-input-text-field.ag-column-select-header-filter-wrapper > div[role='presentation'],
.ag-column-select-header-filter-wrapper.ag-input-field > div[role='presentation'],
ag-input-text-field.ag-column-select-header-filter-wrapper > div:first-child {
  display: flex !important;
  flex: 1 1 auto !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  min-width: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

.ag-column-select-header-filter-wrapper .ag-input-field-label:empty {
  display: none !important;
}

/*
 * Quartz v35: o contorno do campo costuma ficar no <input>. Borda só no input evita “pill” invisível
 * quando o wrapper não herda a regra ou o tema scoped só atinge o input.
 */
.ag-column-select-header-filter-wrapper .ag-input-wrapper {
  flex: 1 1 auto !important;
  align-self: center !important;
  min-width: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-inline: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  min-height: 34px !important;
  max-height: 36px !important;
  overflow: visible !important;
}

.ag-column-select-header-filter-wrapper .ag-text-field-input,
.ag-column-select-header-filter-wrapper .ag-input-field-input {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  border-top: 1px solid color-mix(in srgb, var(--ag-border-color, #94a3b8), transparent 45%) !important;
  border-left: 1px solid color-mix(in srgb, var(--ag-border-color, #94a3b8), transparent 45%) !important;
  border-right: 1px solid color-mix(in srgb, var(--ag-border-color, #94a3b8), transparent 45%) !important;
  border-bottom: none !important;
  border-radius: 10px !important;
  background-color: var(--ag-input-background-color, #0f1419) !important;
  color: var(--ag-input-text-color, #ffffff) !important;
  box-shadow: none !important;
  min-height: 34px !important;
  /* Não usar padding-inline simétrico: o Quartz coloca a lupa em ::before e exige ~26px à esquerda. */
  padding-inline-start: 32px !important;
  padding-inline-end: 12px !important;
}

.ag-column-select-header-filter-wrapper .ag-text-field-input:focus,
.ag-column-select-header-filter-wrapper .ag-input-field-input:focus {
  outline: none !important;
  border-top-color: var(--ag-active-color, ${catalogAccent}) !important;
  border-left-color: var(--ag-active-color, ${catalogAccent}) !important;
  border-right-color: var(--ag-active-color, ${catalogAccent}) !important;
  border-bottom: none !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ag-active-color, ${catalogAccent}), transparent 80%) !important;
}

/*
 * DOM v33+ Enterprise: um único div com .ag-column-select E .ag-column-panel-column-select (não há wrapper extra).
 * Regra por último no part para vencer o CSS injetado do painel + reset de .ag-column-select acima.
 */
.ag-column-panel .ag-column-select.ag-column-panel-column-select {
  box-sizing: border-box !important;
  padding-top: calc(var(--ag-grid-size, 7px) * 3) !important;
  border-top: 0 none transparent !important;
  border-top-width: 0 !important;
}
`,
});

export const produtosCatalogoQuartzTheme = themeQuartz
  .withParams({
    accentColor: catalogAccent,

    headerHeight: CATALOG_GRID_HEADER_PX,
    rowHeight: CATALOG_GRID_HEADER_PX,

    /* Dark ERP — DESIGN_SYSTEM.md §10 (antes: Quartz claro + células #fff em global.css = texto invisível). */
    browserColorScheme: 'dark',
    backgroundColor: '#141B2D',
    foregroundColor: '#FFFFFF',
    chromeBackgroundColor: '#141B2D',
    headerBackgroundColor: '#0F1419',
    headerTextColor: '#ADB5BD',
    borderColor: '#2D3748',
    oddRowBackgroundColor: '#141B2D',
    rowHoverColor: 'rgba(13, 110, 253, 0.08)',
    selectedRowBackgroundColor: 'rgba(13, 110, 253, 0.15)',

    /* Quadradinho com cantos leves + preenchimento sólido ao marcar (demo Quartz / referência anexa). */
    checkboxBorderRadius: CATALOG_CHECKBOX_BORDER_RADIUS_PX,
    checkboxBorderWidth: 1,
    checkboxCheckedBackgroundColor: catalogAccent,
    checkboxCheckedBorderColor: catalogAccent,
    checkboxCheckedShapeColor: '#ffffff',
    checkboxUncheckedBackgroundColor: '#141B2D',
    checkboxUncheckedBorderColor: `color-mix(in srgb, ${catalogAccent} 40%, #2D3748)`,
    checkboxIndeterminateBackgroundColor: '#1E293B',
    checkboxIndeterminateBorderColor: '#2D3748',
    checkboxIndeterminateShapeColor: '#ADB5BD',

    columnBorder: '1px solid #2D3748',
    headerColumnBorder: '1px solid #2D3748',
    headerColumnBorderHeight: '100%',
    headerRowBorder: '1px solid #2D3748',
    rowBorder: '1px solid #1E293B',

    sideBarPanelWidth: CATALOG_SIDEBAR_PANEL_PX,

    /* Barra lateral: contrastar faixa de ícones vs painel (evita “tudo #141B2D”). */
    sideBarBackgroundColor: '#141B2D',
    sideButtonBarBackgroundColor: '#0F1419',
    sideButtonBackgroundColor: 'transparent',
    sideButtonTextColor: '#718096',
    sideButtonHoverBackgroundColor: '#1E293B',
    sideButtonHoverTextColor: '#FFFFFF',
    sideButtonSelectedBackgroundColor: '#1E293B',
    sideButtonSelectedTextColor: '#FFFFFF',
    sideButtonSelectedUnderlineColor: catalogAccent,
    sideButtonBorder: '1px solid #2D3748',
    sideButtonSelectedBorder: '1px solid #2D3748',
    sidePanelBorder: '1px solid #2D3748',
    toolPanelSeparatorBorder: '1px solid #2D3748',

    /* Inputs nos painéis Colunas / Filtros */
    inputBackgroundColor: '#0F1419',
    inputBorder: '1px solid #2D3748',
    inputTextColor: '#FFFFFF',
    inputPlaceholderTextColor: '#718096',
    inputIconColor: '#718096',
    inputFocusBackgroundColor: '#0F1419',
    inputFocusBorder: '1px solid #0091ff',
    inputFocusTextColor: '#FFFFFF',
    inputFocusShadow: '0 0 0 2px rgba(0, 145, 255, 0.28)',

    wrapperBorder: '1px solid #2D3748',
    wrapperBorderRadius: 8,
  })
  .withPart(produtosCatalogoColumnPanelPart);
