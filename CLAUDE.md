# DbMercado — Contexto do Projeto

> Arquivo lido automaticamente pelo Claude Code e pelo Cursor.
> Última atualização: inspecionado ao vivo em 04/04/2026.

---

## 1. O que é o DbMercado

Sistema de gestão de estoque e fulfillment. O intermediário:
- Importa ou compra produtos no mercado interno
- Armazena em Operadores Logísticos (3PLs)
- Vende para Clientes que podem vender via marketplace do operador ou transferir estoque

O sistema NÃO controla estoque do cliente — apenas o estoque próprio nos operadores.

---

## 2. Stack

### Frontend (porta 3000)
- React + TypeScript, Vite
- Tailwind CSS
- AG Grid Enterprise (SSRM)
- TanStack Query + Zustand
- lucide-react (ícones — exclusivo)
- i18next (pt-BR, en-US, zh-CN)
- SignalR (@microsoft/signalr)
- Poppins (fonte — já carregada)
- dnd-kit (drag-and-drop)
- Uppy (@uppy/core, @uppy/xhr-upload) — modo headless

### Backend (porta 5046)
- .NET Core 9.0, Entity Framework Core, SQL Server
- Clean Architecture: Domain → Application → Infrastructure → Api
- JWT auth + refresh token
- Quartz.NET para jobs agendados
- SignalR para realtime

---

## 3. Bounded Contexts

| Contexto         | Status     |
|------------------|------------|
| Administracao    | ✅ Funcional — usuários, roles, permissões, JWT |
| Produto          | ✅ Funcional — catálogo, SKUs, unidades, categoria |
| Importacao       | ✅ Funcional — NF-e, itens, produtos importados |
| Midia            | ✅ Funcional — upload imagem/vídeo, associação, limpeza |
| CategoriaProduto | ✅ Funcional — árvore hierárquica 4 níveis |
| Financeiro       | 🔲 Placeholder |
| Logistica        | 🔲 Placeholder |
| Marketplace      | 🔲 Placeholder |
| Pedidos          | 🔲 Placeholder |

---

## 4. Endpoints disponíveis

```
Auth:     POST /api/Auth/login|logout|refresh|revoke

Produtos:
  GET/POST       /api/produtos
  GET/PUT/DELETE /api/produtos/{id}
  GET            /api/produtos/{id}/logistica
  GET/POST       /api/produtos/{id}/midias
  DELETE         /api/produtos/midia/{midiaId}
  POST           /api/produtos/consultas/grid  (SSRM)
  GET            /api/produtos/consultas/por-marca|por-ncm|por-origem|por-unidade-medida
  GET            /api/produtos/parametros/origens-geograficas|origens-icms
  GET            /api/produtos/parametros/tipos-embalagem
  GET            /api/produtos/parametros/unidades-comercializacao|dimensao|medida|peso

Categorias:
  GET/POST       /api/categorias-produto
  GET/PUT/DELETE /api/categorias-produto/{id}

Importação:
  GET/POST /api/importacao/notas-fiscais
  GET/POST /api/importacao/produtos-importados
```

---

## 5. Estrutura do Frontend

```
src/
├── app/routes/AppRoutes.tsx
├── design-system/global.css + components/(Button|Modal|Toast)
├── integrations/dotnet-api/ (adminDotnetApiClient, config BASE_URL=5046)
│                realtime/   (SignalR AdminRealtimeProvider)
├── modules/
│   ├── auth/         ✅ LoginPage, authService
│   ├── audit/        ✅ AuditPage
│   ├── dashboard/    ✅ DashboardPage
│   ├── users/        ✅ UsersPage
│   ├── roles/        ✅ RolesPage
│   ├── products/     ✅ Módulo completo (ver abaixo)
│   ├── orders/       🔲 Placeholder
│   ├── inventory/    🔲 Placeholder
│   └── billing/      🔲 Placeholder
└── shared/
    ├── agGrid/       BaseGrid, agGridLocaleBR, agGridLucideIcons
    ├── components/   layouts, guards, notifications, grid
    ├── hooks/        useAdminGridQuery, useDashboardSummaryQuery
    ├── i18n/         config + locales pt-BR
    ├── query/        invalidateAdminCache, queryKeys
    ├── services/http/ apiClient, retryWithBackoff, fetchWithTimeout
    ├── stores/       authStore, permissionStore, appShellStore,
    │                 modulosUsuarioStore, notificationCenterStore
    └── utils/        deepCamelCaseKeys, jwtPayload, resolveLocalizedErrorMessage
```

### Módulo products — arquivos atuais

```
components/
  CategoriaFacetPanel.tsx    painel lateral de filtros no grid
  CategoriaTreeNode.tsx      nó da árvore
  FiltrosAtivosChips.tsx     chips de filtros ativos
  ProdutoForm.tsx            formulário criar/editar
  ProdutosGrid.tsx           grid SSRM
  ProdutosGridEmptyOverlay.tsx
  productFacetNav.css

constants/
  origemGeografica.ts        ORIGEM_GEOGRAFICA_IMPORTADO

grid/
  ProdutoAcoesCell.tsx
  ProdutoDeleteConfirmModal.tsx
  catalogColumnPanelHeadStyles.ts
  produtoGridColDefs.ts
  produtosQuartzTheme.ts
  useProdutoGridResponsiveLayout.ts

hooks/
  useCategoriaArvore.ts      exports: useCategoriaArvore, resolverCaminho

media/                       Media Studio ✅
  components/
    MediaCard.tsx
    MediaDropzone.tsx
    MediaGrid.tsx
    ProductMediaStudio.tsx
  hooks/
    useMediaDragDrop.ts      export: useMediaDragSensors
    useMediaUploader.ts      Uppy headless
  services/
    midiaService.ts          exports: uploadMidiaProduto, associarMidiasProduto,
                             excluirMidiaProduto, listarMidiasProduto,
                             montarPayloadAssociarMidias,
                             temMidiaAguardandoUpload, temMidiaNaoPersistivelNaGrelha,
                             urlMidiaAbsoluta
  store/
    mediaStore.ts            useMediaStore (Zustand)
                             actions: adicionarItens, atualizarItem, removerItem,
                             substituirItens, reordenar, definirPrincipal, limparTudo
  utils/
    gerarThumbnailVideo.ts   thumbnail no frame t=1

pages/
  ProductsListPage.tsx       grid + painel facetas + chips filtros
  ProdutoEditarPage.tsx
  ProdutoNovoPage.tsx

services/
  categoriaService.ts        listarArvoreCategoriasProduto
  produtoService.ts          criarProduto, atualizarProduto, excluirProduto,
                             obterProdutoPorId, consultarProdutosGrid,
                             listarProdutosResumo, listarOrigensGeograficasProduto,
                             listarOrigensIcmsProduto, listarTiposEmbalagemProduto,
                             listarUnidadesComercializacaoProduto,
                             listarUnidadesDimensaoProduto, listarUnidadesMedidaProduto,
                             listarUnidadesPesoProduto

types/
  categoriaTypes.ts          FILTROS_ATIVOS_VAZIO
  produtoFormValues.ts       createEmptyProdutoFormValues()
                             campos: nome, descricao, marca, modelo, gtin,
                             unidadeComercializacao, unidadeMedidaFisica, tipoEmbalagem,
                             origemTipo, paisOrigem, ncm, cest, origemIcms,
                             alturaEmb, larguraEmb, comprimentoEmb, pesoEmb,
                             unidadeDimensaoEmb, unidadePesoEmb,
                             incluirDimProduto, alturaP, larguraP, comprimentoP,
                             pesoP, unidadeDimensaoP, unidadePesoP, skus
                             ⚠️ PENDENTE: adicionar categoriaProdutoId

utils/
  fiscalDigitos.ts           somenteDigitosAscii
  produtoFormMappers.ts      produtoDetalheToFormValues, produtoFormValuesToUpsert
  produtoFormParse.ts        parseDecimalDoFormulario
  validateProdutoForm.ts     validateProdutoForm
```

---

## 6. DTOs do Backend (inspecionados ao vivo)

### ProdutoCreateDto / ProdutoUpdateDto
```
nome, descricao, marca, modelo, gtin, categoriaProdutoId,
unidadeComercializacao, unidadeMedidaFisica, tipoEmbalagem,
origemGeografica, dadosFiscais, dimensaoProduto, dimensaoEmbalagem,
skus, atributos, midias
```

### ProdutoResponseDto
```
id, nome, descricao, marca, modelo, gtin,
categoriaProdutoId, categoriaNome, categoriaSlug, categoriaCaminho,
unidadeComercializacao, unidadeMedidaFisica, tipoEmbalagem,
origemGeografica, dadosFiscais, dimensaoProduto, dimensaoEmbalagem,
skus, atributos
```
NOTA: mídias NÃO retornam no ProdutoResponseDto — usar GET /api/produtos/{id}/midias

### MidiaResponseDto
```
id, url, thumbnailUrl, tipo, ordem, isPrincipal, duracao, status
```

### ProdutoGridRowDto
```
isGroup, id, nome, unidadeComercializacao, unidadeMedidaFisica,
tipoEmbalagem, marca, categoriaNome, categoriaSlug, childCount, groupKey
```

### ProdutoGridQueryDto
```
startRow, endRow, sortModel, filterModel,
rowGroupCols, groupKeys, valueCols, pivotMode,
categoriaIdFiltro, origemFiltro
```

---

## 7. Design System — Obrigatório

TEMA ESCURO ABSOLUTO. Nunca bg-white, bg-gray-*, text-gray-*.

### Paleta
```
#0F1419  fundo global        #141B2D  surface cards
#2D3748  borda               #1E293B  borda sutil
#0D6EFD  accent              #DC3545  danger
#198754  success             #FFC107  warning
#FFFFFF  texto primário      #ADB5BD  texto secundário
#718096  texto muted
```

### Fonte: Poppins (já carregada). Nunca Inter, Roboto ou Arial.
### Ícones: lucide-react exclusivamente.

### Padrão fieldset (seções do formulário de produto)
```tsx
<fieldset className="min-w-0 rounded-xl border border-[#2D3748] bg-[#141B2D] p-6 shadow-sm md:p-8">
  <legend className="sr-only">Nome</legend>
  <div className="flex w-full items-center gap-2 border-b border-orange-500/25
                  pb-4 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-6"
       aria-hidden="true">
    <Icone size={16} className="shrink-0" aria-hidden="true" />
    Nome da Seção
  </div>
</fieldset>
```
ATENÇÃO: headers de seção usam text-orange-400 + border-orange-500/25

### Grids administrativos (AG Grid)

- **Componente único:** `BaseGrid` em `src/shared/components/grid` — é o “base grid” da ferramenta; não usar `AgGridReact` solto nas telas admin.
- **Visual ERP:** `variant="adminCatalog"` + wrapper com **`admin-ssrm-grid-host`** (obrigatório: aplica variáveis escuras em `global.css`; sem isso o AG Grid fica branco) + `produtos-grid-host produtos-grid-host--erp` e `produtos-grid-host--catalog-scroll` quando usar `autoHeight` + tokens `CATALOG_GRID_HEADER_PX`, `BASE_GRID_ADMIN_CATALOG_AUTOSIZE_STRATEGY`.
- **Padrão para PR / revisão:** seguir a **checklist numerada** em `DESIGN_SYSTEM.md` §10 (“Checklist obrigatória — novo grid admin SSRM”); pode ser colada na descrição do PR ao adicionar um grid novo.
- **Referências:** `ProdutosGrid.tsx`, `LogsGrid.tsx`, `JobExecucoesGrid.tsx`. Qualquer nova lista tabular deve alinhar a esses três antes de merge.
- **Documentação expandida:** `DESIGN_SYSTEM.md` §10 — regras + checklist + nota de manutenção do `global.css`.

---

## 8. Rotas

| Rota | Status |
|------|--------|
| /admin/dashboard | ✅ |
| /admin/users | ✅ |
| /admin/roles | ✅ |
| /admin/audit | ✅ |
| /admin/produtos | ✅ |
| /admin/produtos/novo | ✅ |
| /admin/produtos/:id | ✅ |
| /admin/orders | 🔲 placeholder |
| /admin/inventory | 🔲 placeholder |
| /admin/billing | 🔲 placeholder |

---

## 9. Roadmap

### Concluído ✅
- Auth JWT + permissões + roles
- CRUD usuários, roles, auditoria
- Catálogo produtos completo (SKUs, 5 tipos de unidades separados)
- Categorização hierárquica (4 níveis, auto-referenciada)
- Grid produtos SSRM + agrupamento + filtros server-side
- Painel facetas (categoria + origem) + chips filtros ativos
- Media Studio (Uppy headless + dnd-kit + thumbnail vídeo t=1)
- Jobs Quartz: LogCleanup + LimpezaMidiasTemporarias
- IStorageService + LocalStorageService V1
- Módulo Importação (NF-e)

### Pendente imediato
- [ ] Seletor categoria em cascata no ProdutoForm.tsx
- [ ] Adicionar categoriaProdutoId em ProdutoFormValues + mapper

### Próximas fases
1. Operadores Logísticos + Clientes
2. Estoque por Operador
3. Compras Mercado Interno
4. Pedidos de Venda + Logística
5. Marketplace
6. Financeiro

---

## 10. Regras — NÃO VIOLAR

### Frontend
- Nunca bg-white ou tema claro
- Nunca texto hardcoded em português no JSX (usar i18n)
- Nunca importar de outro módulo (só de shared/)
- Nunca AG Grid clientSide em produção
- Grids administrativos: sempre `BaseGrid` com `variant="adminCatalog"` **e** wrapper com `admin-ssrm-grid-host` + `produtos-grid-host produtos-grid-host--erp` (checklist em `DESIGN_SYSTEM.md` §10; sem `admin-ssrm-grid-host` o grid fica branco)
- Nunca `AgGridReact` direto nas páginas admin para listagens SSRM
- Nunca ícones além de lucide-react
- Nunca dashboard nativo do Uppy
- Nunca estado de mídia dentro do formulário (usar useMediaStore)
- NÃO é Next.js — sem SSR, Server Actions

### Backend
- Nunca connection string hardcoded
- Nunca lógica de negócio em Controllers
- Nunca entidades com setters públicos
- Nunca integrações externas no Domain
- Nunca base64 para mídia
- Nunca buffer binário no banco
- Nunca nomenclatura em inglês (usar português)

---

## 11. Configuração

### Variáveis de ambiente (Frontend)
```
VITE_API_BASE_URL / VITE_DOTNET_API_BASE_URL = http://localhost:5046
```

### appsettings.json (Backend)
```
ConnectionStrings:DefaultConnection
JwtSettings:SecretKey / ExpirationHours
Storage:Local:Pasta = uploads/produtos
Storage:Local:UrlBase = /uploads/produtos
Quartz:LogCleanup:Enabled / CronSchedule / RetentionDays
Quartz:LimpezaMidias:Enabled / CronSchedule / RetencaoHoras / TamanhoBatch
```

### Comandos
```bash
dotnet run --project DbMercado.Api --launch-profile http
dotnet ef migrations add [Nome] --project DbMercado.Infrastructure --startup-project DbMercado.Api
dotnet ef database update --project DbMercado.Infrastructure --startup-project DbMercado.Api
npm run dev   # porta 3000
```
