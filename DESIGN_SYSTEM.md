# DbMercado — Design System Frontend

> **Arquivo de referência para o Cursor e qualquer agente de código.**  
> Toda decisão visual, de layout e de interação deve seguir estas diretrizes.  
> Dúvida? Consulte este arquivo antes de inventar uma solução.

---

## 1. Tema — Dark ERP

O projeto usa **tema escuro** como padrão absoluto. O design system já define as variáveis CSS. Nunca usar `bg-white`, `bg-neutral-*`, `text-neutral-900` ou similares de tema claro em componentes de página.

```
Fundo global:      #0F1419   (--ds-color-bg-app)
Surface (cards):   #141B2D   (--ds-color-surface)
Surface elevado:   rgba(20, 27, 45, 0.95)  (--ds-color-surface-elevated)
Borda:             #2D3748   (--ds-color-border)
Borda sutil:       #1E293B   (--ds-color-border-subtle)
```

---

## 2. Paleta de Cores

### Cores base
```css
--ds-color-accent:        #0D6EFD   /* azul primário — botões, links, foco */
--ds-color-accent-hover:  #0B5ED7   /* hover do primário */
--ds-color-accent-muted:  rgba(13, 110, 253, 0.18)  /* fundo suave de destaque */
--ds-color-danger:        #DC3545   /* erros, exclusão */
--ds-color-success:       #198754   /* confirmações, status ativo */
--ds-color-warning:       #FFC107   /* alertas */
--ds-color-focus-ring:    rgba(13, 110, 253, 0.45)
```

### Texto
```css
--ds-color-text-primary:   #FFFFFF
--ds-color-text-secondary: #ADB5BD
--ds-color-text-muted:     #718096
```

### Uso no AG Grid
O acento do grid é `#0091FF` — levemente mais claro que o accent do DS.  
Manter esse valor apenas no tema Quartz. Nos demais componentes usar `--ds-color-accent`.

---

## 3. Tipografia

### Fonte
- **Principal:** `Poppins` (Google Fonts, já carregada)  
- **Código/mono:** `ui-monospace, 'Fira Code', Menlo`
- ⚠️ Nunca usar Inter, Roboto ou Arial — o projeto já importa Poppins via tokens

### Escala
```
2xs  → 10px  (labels de badge, status)
xs   → 12px  (captions, rodapés de tabela)
sm   → 14px  (body texto, labels de campo)
md   → 16px  (body padrão)
lg   → 18px  (subtítulos)
xl   → 20px  (títulos de seção)
2xl  → 24px  (títulos de página)
3xl  → 30px  (KPIs, números grandes)
```

### Pesos
```
400 regular  → texto corrido
500 medium   → labels, descrições de campo
600 semibold → títulos de seção, cabeçalhos de tabela
700 bold     → títulos de página, KPIs
```

---

## 4. Espaçamento

Seguir a escala de tokens. Não inventar valores avulsos.

```
xxs →  2px   (separadores internos)
xs  →  4px   (gap entre ícone e label)
sm  →  8px   (padding interno de chips/badges)
md  → 12px   (padding de inputs)
lg  → 16px   (gap entre campos de formulário)
xl  → 24px   (gap entre seções, padding de cards)
2xl → 32px   (padding de páginas)
3xl → 48px   (separação entre blocos maiores)
```

---

## 5. Raios de Borda

```
sm   →  4px  (chips, badges pequenos)
md   →  8px  (inputs, botões, cards pequenos)
lg   → 12px  (cards de seção, modais)
xl   → 16px  (painéis, drawers)
full → 9999px (pills, avatares)
```

---

## 6. Elevação (Sombras)

```css
xs  → 0 1px 2px rgba(0,0,0,0.22)     /* separadores sutis */
sm  → 0 2px 8px rgba(0,0,0,0.28)     /* cards */
md  → 0 4px 16px rgba(0,0,0,0.32)    /* dropdowns, popovers */
lg  → 0 10px 30px rgba(0,0,0,0.35)   /* modais, painéis laterais */
xl  → 0 18px 48px rgba(0,0,0,0.45)   /* overlays importantes */
```

---

## 7. Componentes — Padrões

### 7.1 Inputs e campos de formulário

```tsx
// Estado normal
className="h-10 w-full rounded-md border border-[#2D3748] bg-[#141B2D]
           px-3 py-2 text-sm text-white placeholder:text-[#718096]
           shadow-sm transition-colors
           focus:border-[#0D6EFD] focus:outline-none focus:ring-2 
           focus:ring-[rgba(13,110,253,0.45)]"

// Estado de erro
className="... border-[#DC3545] focus:border-[#DC3545] focus:ring-[rgba(220,53,69,0.3)]"

// Regras gerais:
// - Sempre h-10 para consistência
// - Nunca bg-white em formulários de página
// - Placeholder sempre text-muted (#718096)
```

### 7.2 Labels

```tsx
className="mb-1.5 block text-sm font-medium text-[#ADB5BD]"
// Nota: no tema escuro, labels são text-secondary (não text-primary)
```

### 7.3 Fieldsets de seção (formulários)

```tsx
className="rounded-xl border border-[#2D3748] bg-[#141B2D] 
           p-6 md:p-8 shadow-sm"

// Legend / título da seção:
className="mb-6 flex items-center gap-2 border-b border-[#2D3748] 
           pb-3 text-xs font-semibold uppercase tracking-widest 
           text-[#718096]"
// Incluir ícone Lucide antes do texto da legend
```

### 7.4 Botões

```tsx
// Primário
className="inline-flex items-center gap-2 rounded-md bg-[#0D6EFD] 
           px-5 py-2.5 text-sm font-semibold text-white shadow-sm 
           transition-all hover:bg-[#0B5ED7] hover:shadow-md
           focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)]
           disabled:cursor-not-allowed disabled:opacity-50"

// Secundário
className="inline-flex items-center gap-2 rounded-md border 
           border-[#2D3748] bg-[#141B2D] px-5 py-2.5 
           text-sm font-medium text-[#ADB5BD] shadow-sm 
           transition-all hover:border-[#4A5568] hover:text-white
           focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)]"

// Destrutivo
className="inline-flex items-center gap-2 rounded-md border 
           border-[#DC3545]/30 bg-[#DC3545]/10 px-5 py-2.5 
           text-sm font-medium text-[#DC3545] 
           transition-all hover:bg-[#DC3545]/20
           disabled:cursor-not-allowed disabled:opacity-50"

// Ghost / ícone
className="rounded-md p-2 text-[#718096] transition-colors 
           hover:bg-[#1E293B] hover:text-white
           focus:outline-none focus:ring-1 focus:ring-[#2D3748]"
```

### 7.5 Badges / Status

```tsx
// Ativo / Sucesso
className="inline-flex items-center gap-1 rounded-full 
           bg-[#198754]/15 px-2.5 py-0.5 
           text-xs font-medium text-[#198754]"

// Inativo / Neutro
className="inline-flex items-center gap-1 rounded-full 
           bg-[#2D3748] px-2.5 py-0.5 
           text-xs font-medium text-[#718096]"

// Alerta / Warning
className="inline-flex items-center gap-1 rounded-full 
           bg-[#FFC107]/15 px-2.5 py-0.5 
           text-xs font-medium text-[#FFC107]"

// Erro / Perigo
className="inline-flex items-center gap-1 rounded-full 
           bg-[#DC3545]/15 px-2.5 py-0.5 
           text-xs font-medium text-[#DC3545]"
```

### 7.6 Cards / Painéis

```tsx
// Card padrão
className="rounded-xl border border-[#2D3748] bg-[#141B2D] 
           p-6 shadow-sm"

// Card elevado (modal, dropdown)
className="rounded-xl border border-[#2D3748] 
           bg-[rgba(20,27,45,0.95)] p-6 
           shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm"
```

### 7.7 Mensagens de erro de campo

```tsx
// Sempre abaixo do input, min-h para não pular layout
<p className="mt-1.5 min-h-[1.1rem] text-xs text-[#DC3545]">
  {message}
</p>
```

---

## 8. Layout de Página

### Header de página (padrão para todos os módulos)

```tsx
<div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-2xl font-bold text-white">{título}</h1>
    <p className="mt-0.5 text-sm text-[#718096]">{subtítulo}</p>
  </div>
  <div className="flex items-center gap-3">
    {/* botões de ação */}
  </div>
</div>
```

### Sticky action bar (formulários longos)

```tsx
// Fixar no topo ao scrollar — salvar e cancelar sempre visíveis
<div className="sticky top-0 z-10 flex items-center justify-between 
                rounded-xl border border-[#2D3748] bg-[rgba(20,27,45,0.95)] 
                px-6 py-4 shadow-md backdrop-blur-sm mb-6">
  <h2 className="text-lg font-semibold text-white">{título do form}</h2>
  <div className="flex items-center gap-3">
    <BotãoCancelar />
    <BotãoSalvar />
  </div>
</div>
```

### Separação entre seções de formulário

```
gap-8 entre fieldsets (não gap-6)
```

---

## 9. Ícones

Usar **exclusivamente** `lucide-react`. Nunca emojis, nunca SVGs inline avulsos, nunca outras bibliotecas de ícones.

```tsx
import { Package, Tag, Ruler, DollarSign, Plus, Pencil, Trash2, 
         ChevronRight, X, Check, AlertCircle, Search } from 'lucide-react';

// Tamanhos padrão:
// Botões:      size={16}  (inline com texto)
// Ícones solo: size={18}  (ações de linha de tabela)
// Títulos:     size={20}  (junto de legend/header de seção)
// KPIs:        size={24}
```

### Ícones sugeridos por seção do formulário de Produto

```
📦 Identificação  → <Package size={16} />
🏷️ Fiscal/Origem  → <Tag size={16} />
📐 Embalagem      → <Ruler size={16} />
📏 Dimensões      → <Maximize2 size={16} />
🔑 SKUs           → <Key size={16} />
```

---

## 10. AG Grid — Tema Dark

### BaseGrid — shell obrigatório (admin)

**Sim: existe um componente base.** Todo grid de listagem no painel administrativo deve passar por `BaseGrid` (`src/shared/components/grid/BaseGrid.tsx`), exportado também em `src/shared/components/grid/index.ts`. **Não monte `AgGridReact` diretamente** em páginas de módulo (evita tema, ícones Lucide, defaults e variantes divergirem).

| Regra | Detalhe |
|--------|---------|
| Variante ERP | `variant="adminCatalog"` — Quartz escuro alinhado a produtos e logs (`adminCatalogQuartzTheme`). |
| Host | Wrapper com `produtos-grid-host produtos-grid-host--erp admin-ssrm-grid-host` (+ `produtos-grid-host--catalog-scroll` quando `domLayout: autoHeight`). A classe **`admin-ssrm-grid-host`** liga os overrides de tema escuro em `design-system/global.css` (AG Grid v35+); sem ela o grid cai no fundo branco padrão da folha `ag-grid.css`. |
| Alturas | `rowHeight={44}`, `headerHeight={CATALOG_GRID_HEADER_PX}` de `shared/agGrid/adminCatalogQuartzTheme`. |
| Colunas | `autoSizeStrategy={BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY}`; `defaultColDef` só por cima dos merges do `BaseGrid`. |
| SSRM | `rowModelType="serverSide"` + datasource; paginação alinhada ao catálogo quando fizer sentido. |

**Referência de implementação:** comparar `modules/products/components/ProdutosGrid.tsx`, `modules/logs/components/LogsGrid.tsx` e `modules/jobExecucoes/components/JobExecucoesGrid.tsx`. Novos grids devem copiar esse conjunto de props/tokens antes de especializar colunas e datasource.

### Checklist obrigatória — novo grid admin SSRM (PR / code review)

Use esta lista na ordem; **não pule itens**. Falhas comuns: esquecer `admin-ssrm-grid-host` (grid fica **branco**) ou montar `AgGridReact` fora do `BaseGrid`.

1. [ ] Componente de lista usa **`BaseGrid`** de `src/shared/components/grid` (nunca `AgGridReact` direto na página).
2. [ ] Prop **`variant="adminCatalog"`**.
3. [ ] O `div` que envolve o `BaseGrid` inclui **obrigatoriamente** as classes:  
   `produtos-grid-host produtos-grid-host--erp admin-ssrm-grid-host`  
   (e `produtos-grid-host--catalog-scroll` quando `domLayout="autoHeight"`).
4. [ ] `rowHeight={44}`, `headerHeight={CATALOG_GRID_HEADER_PX}`, `autoSizeStrategy={BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY}` (import de `adminCatalogQuartzTheme` / `grid/index`).
5. [ ] `rowModelType="serverSide"` + datasource; locale de paginação alinhado ao catálogo (chaves `modules.productsAdmin.agPagination*` no i18n, se reutilizar os mesmos rótulos).
6. [ ] Revisão visual: fundo da área do grid **#141B2D**, cabeçalho escuro — se aparecer branco, o passo 3 foi omitido ou o wrapper não é pai direto do tema.

**Manutenção de CSS:** os tokens que corrigem o fundo branco do AG Grid v35+ estão em `src/design-system/global.css` sob o seletor **`.admin-ssrm-grid-host.produtos-grid-host--erp`**. Novos grids **não** precisam de novo bloco CSS desde que o host carregue essas classes. Só altere `global.css` se o próprio padrão ERP mudar (aí um único lugar atualiza todos os grids).

---

O tema do grid já usa o Quartz com acento `#0091FF`. Para consistência com o tema escuro, ao evoluir o tema:

```ts
// Parâmetros a adicionar/manter no produtosCatalogoQuartzTheme:
backgroundColor: '#141B2D',
oddRowBackgroundColor: '#141B2D',
rowHoverColor: 'rgba(13, 110, 253, 0.08)',
selectedRowBackgroundColor: 'rgba(13, 110, 253, 0.15)',
headerBackgroundColor: '#0F1419',
headerTextColor: '#ADB5BD',
borderColor: '#2D3748',
foregroundColor: '#FFFFFF',
secondaryForegroundColor: '#718096',
```

### Coluna de ações (padrão para todos os grids)

```tsx
// Ícones aparecem só no hover da linha
// Usar ag-row:hover com classe CSS para controlar opacity
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 
                transition-opacity duration-150">
  <button title="Editar"
    className="rounded p-1.5 text-[#0D6EFD] hover:bg-[#0D6EFD]/10 
               transition-colors">
    <Pencil size={15} />
  </button>
  <button title="Excluir"
    className="rounded p-1.5 text-[#DC3545] hover:bg-[#DC3545]/10 
               transition-colors">
    <Trash2 size={15} />
  </button>
</div>
```

### Empty state do grid

```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <Package size={48} className="mb-4 text-[#2D3748]" />
  <p className="text-base font-medium text-[#ADB5BD]">Nenhum produto encontrado</p>
  <p className="mt-1 text-sm text-[#718096]">Tente ajustar os filtros ou adicione um novo produto.</p>
  <button className="mt-6 ... [botão primário]">
    <Plus size={16} /> Novo Produto
  </button>
</div>
```

---

## 11. Animações e Transições

```css
/* Transição padrão para estados interativos */
transition-colors duration-150 ease-in-out

/* Hover de cards/links */
transition-all duration-200 ease-in-out

/* Animação de erro em campo (shake) */
@keyframes field-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-4px); }
  40%       { transform: translateX(4px); }
  60%       { transform: translateX(-3px); }
  80%       { transform: translateX(3px); }
}
.field-error-shake { animation: field-shake 0.35s ease-in-out; }

/* Entrada de modais e painéis */
transition: opacity 200ms, transform 200ms
from: opacity-0 translate-y-2
to:   opacity-100 translate-y-0
```

---

## 12. Inconsistência Atual a Corrigir

> ⚠️ **Atenção:** O `ProdutoForm.tsx` atual usa classes Tailwind de tema **claro**  
> (`bg-white`, `border-neutral-200`, `text-neutral-700`, etc.).  
> Isso conflita com o design system escuro definido nos tokens.  
>
> **Ao refatorar ou criar novos formulários, sempre usar as classes do tema escuro  
> conforme este documento.**

---

## 13. Checklist antes de entregar qualquer componente

- [ ] Usa variáveis CSS do DS ou valores hex alinhados ao tema escuro?
- [ ] Inputs têm `h-10` fixo?
- [ ] Labels são `text-[#ADB5BD]` (secondary), não branco puro?
- [ ] Botão primário usa `#0D6EFD` (não sky-*, blue-600 ou outros)?
- [ ] Ícones são de `lucide-react`?
- [ ] Mensagens de erro têm `min-h` para não causar layout shift?
- [ ] Seções de formulário têm `gap-8` entre elas?
- [ ] Sticky action bar presente em formulários com mais de 3 seções?
- [ ] Empty state implementado no grid?
- [ ] Nenhum `bg-white` ou cor de tema claro escapou?
