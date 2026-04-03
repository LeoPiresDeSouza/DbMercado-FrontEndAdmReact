# DbMercado — Contexto do Projeto

> Este arquivo é lido automaticamente pelo Claude Code / Cursor.  
> Contém o contexto estratégico, arquitetural e de negócio do projeto.  
> **Consulte-o antes de qualquer decisão de código.**

---

## 1. O que é o DbMercado

Sistema de **gestão de estoque e fulfillment** para um intermediário que:

- Importa produtos do exterior **ou** compra no mercado interno
- Armazena em **Operadores Logísticos** (3PLs) cadastrados
- Vende os produtos para **Clientes**
- Os clientes podem vender via **marketplace diretamente do operador logístico** (fulfillment) ou transferir os produtos para outro operador

> O sistema **não controla o estoque do cliente** — apenas o estoque próprio nos operadores logísticos.

---

## 2. Stack Tecnológica

### Frontend
- **React** com TypeScript
- **Tailwind CSS** para estilos
- **AG Grid Enterprise** (SSRM — Server Side Row Model) para grids
- **lucide-react** para ícones (exclusivamente)
- **i18next** para internacionalização (pt-BR, en-US, zh-CN)
- **SignalR** para realtime
- **Vite** como bundler
- **Poppins** como fonte principal (já carregada via Google Fonts)

### Backend (.NET)
- **.NET Core 9.0** — API REST principal
- **Entity Framework Core** com SQL Server
- **Clean Architecture** em 4 camadas: Domain → Application → Infrastructure → Api
- **JWT** para autenticação com refresh token
- **CQRS leve** via Application layer

### Backend IA (futuro)
- **Python** — acesso a LLMs, OCR, enriquecimento de dados
- Comunicação via HTTP com o .NET (adaptadores em `Infrastructure/Integracoes/Ia/`)

---

## 3. Arquitetura do Backend

```
DbMercado.Domain          → Entidades, interfaces, Value Objects, exceções de negócio
DbMercado.Application     → Casos de uso, DTOs, interfaces de serviço, mapeamentos
DbMercado.Infrastructure  → Repositórios EF, jobs, providers, integrações externas
DbMercado.Api             → Controllers, middlewares, DI, configuração
```

### Bounded Contexts definidos

| Contexto       | Status       | Descrição |
|----------------|--------------|-----------|
| Administracao  | ✅ Funcional | Usuários, roles, permissões, autenticação |
| Produto        | ✅ Funcional | Catálogo de produtos com SKUs |
| Importacao     | ✅ Funcional | NF-e, itens de NF, produtos importados |
| Financeiro     | 🔲 Vazio     | Contas a pagar e receber |
| Logistica      | 🔲 Vazio     | Operadores logísticos, movimentações |
| Marketplace    | 🔲 Vazio     | Integração com marketplaces |
| Pedidos        | 🔲 Vazio     | Pedidos de venda |

### Regras arquiteturais do backend

- **Entidades** têm setters privados — mutações via métodos de domínio
- **Exceções de negócio** herdam de `BusinessException` (código + mensagem)
- **Integrações externas** ficam em `Infrastructure/Integracoes/` — nunca em Domain
- **Connection string** via `appsettings.json` ou User Secrets — nunca hardcoded
- **Logs** persistidos na tabela `AppLog` via `DatabaseLoggerProvider`
- **Respostas de erro** seguem `ProblemDetails` (RFC 7807)
- **Migrations** sempre via `dotnet ef database update --project DbMercado.Infrastructure --startup-project DbMercado.Api`

---

## 4. Arquitetura do Frontend

```
src/
├── app/              → Roteamento raiz, composição da aplicação
├── design-system/    → Tokens CSS, global.css (NUNCA colocar regras de negócio aqui)
├── modules/          → Feature folders por domínio (auth, products, orders, etc.)
│   └── [módulo]/
│       ├── components/   → Componentes do módulo
│       ├── pages/        → Páginas roteáveis
│       ├── services/     → Chamadas HTTP do módulo
│       ├── types/        → Tipos e interfaces
│       └── utils/        → Helpers específicos do módulo
├── shared/           → Transversal: guards, layouts, componentes genéricos
└── integrations/     → HTTP client, configuração de API
```

### Regras arquiteturais do frontend

- **Cada módulo é autossuficiente** — não importar de outros módulos, apenas de `shared/`
- **Design system** sempre consultado antes de criar estilos
- **Tema escuro obrigatório** — `bg-white` e classes de tema claro são proibidas
- **AG Grid** usa sempre SSRM para listas — nunca `clientSide` em produção
- **Ícones** exclusivamente de `lucide-react`
- **i18n** obrigatório — nunca texto hardcoded em português no JSX
- **Formulários** sempre com sticky action bar quando tiverem mais de 3 seções

---

## 5. Módulos do Frontend — Estado Atual

| Módulo       | Status       | Observações |
|--------------|--------------|-------------|
| auth         | ✅ Funcional | Login JWT, guards de rota |
| dashboard    | ✅ Funcional | KPIs, layout |
| users        | ✅ Funcional | CRUD de usuários |
| roles        | ✅ Funcional | CRUD de perfis/permissões |
| audit        | ✅ Funcional | Timeline de auditoria |
| products     | 🔧 Em desenvolvimento | Grid SSRM ok, formulário ok mas com inconsistência de tema (usa classes claro) |
| orders       | 🔲 Placeholder | A implementar |
| inventory    | 🔲 Placeholder | A implementar |
| billing      | 🔲 Placeholder | A implementar |

---

## 6. Design System — Resumo Rápido

> Arquivo completo: `DESIGN_SYSTEM.md` na raiz do frontend

**Paleta principal:**
```
Fundo:    #0F1419    Surface:  #141B2D    Borda:    #2D3748
Accent:   #0D6EFD   Danger:   #DC3545    Success:  #198754
Texto 1:  #FFFFFF    Texto 2:  #ADB5BD    Muted:    #718096
```

**Fonte:** Poppins (já carregada)  
**Ícones:** lucide-react  
**Raio padrão de cards:** `rounded-xl` (12px)  
**Inputs:** sempre `h-10`, fundo `#141B2D`, borda `#2D3748`

---

## 7. Roadmap de Desenvolvimento

### Fase 1 — Base operacional (próxima)
1. **Operadores Logísticos** — CRUD completo (backend + frontend)
2. **Clientes** — CRUD com PJ/PF, vínculos com operadores
3. **Estoque por Operador** — saldo, movimentações de entrada/saída

### Fase 2 — Fluxo de entrada
4. **Compras Mercado Interno** — pedido de compra → recebimento → estoque
5. **Importação** — vincular `ProdutoImportado` ao estoque (domínio já tem base)

### Fase 3 — Fluxo de saída
6. **Pedidos de Venda** — cliente → produto → operador logístico
7. **Logística** — transferência entre operadores
8. **Marketplace** — integração para venda direta do operador

### Fase 4 — Financeiro
9. **Contas a Pagar** — compras, importações, frete
10. **Contas a Receber** — vendas, repasse de marketplace

---

## 8. Padrões de Código

### Backend — Novo bounded context

Ao criar um novo contexto (ex: Logistica), seguir esta estrutura:

```
DbMercado.Domain/Logistica/
  Entities/          → Entidades com setters privados
  Interfaces/
    Repositories/    → ILogisticaRepository
    UnitsOfWork/     → ILogisticaUnitOfWork
  Enums/             → Enums do contexto
  ValueObjects/      → VOs imutáveis

DbMercado.Application/Logistica/
  Services/          → Casos de uso
  Dtos/              → Request/Response DTOs
  Interfaces/        → ILogisticaService
  Mapping/           → AutoMapper profiles

DbMercado.Infrastructure/Logistica/
  Repositories/      → Implementações EF
  UnitsOfWork/
  Persistence/
    Mappings/        → EntityTypeConfiguration

DbMercado.Api/Controllers/Logistica/
  → Controller com [Authorize], verbos REST, ProblemDetails
```

### Frontend — Novo módulo

Ao criar um novo módulo (ex: inventory), seguir:

```
src/modules/inventory/
  components/        → Componentes do módulo
  pages/
    InventoryListPage.tsx    → grid SSRM
    InventoryNovoPage.tsx    → formulário de criação
    InventoryEditarPage.tsx  → formulário de edição
  grid/
    inventoryGridColDefs.ts
    inventoryQuartzTheme.ts  → herdar do tema base
  services/
    inventoryService.ts      → chamadas HTTP
  types/
    inventoryFormValues.ts
  utils/
    inventoryFormMappers.ts
    validateInventoryForm.ts
```

---

## 9. Convenções de Nomenclatura

### Backend
- Entidades: `[Nome]Entity` (ex: `OperadorLogisticoEntity`)
- DTOs: `[Nome]Dto`, `Criar[Nome]Request`, `[Nome]Response`
- Repositórios: `I[Nome]Repository` (interface), `[Nome]Repository` (impl)
- Controllers: `[Contexto]Controller`
- Exceções: `BusinessException("CODIGO_ERRO", "Mensagem legível")`

### Frontend
- Componentes: PascalCase (`ProdutoForm.tsx`)
- Services: camelCase + sufixo Service (`produtoService.ts`)
- Types: camelCase + sufixo adequado (`produtoFormValues.ts`)
- Chaves i18n: `modules.[modulo].[chave]` (ex: `modules.productsAdmin.fieldNome`)

---

## 10. Variáveis de Ambiente

### Frontend
```
VITE_API_BASE_URL           → URL base da API .NET (padrão: http://localhost:5046)
VITE_DOTNET_API_BASE_URL    → alias do acima
```

### Backend
```
ConnectionStrings:DefaultConnection  → SQL Server
JwtSettings:SecretKey                → chave JWT (User Secrets em dev)
JwtSettings:ExpirationHours          → tempo de expiração do token
```

---

## 11. Comandos Úteis

```bash
# Backend — rodar
dotnet run --project DbMercado.Api --launch-profile http

# Backend — migrations
dotnet ef migrations add [Nome] --project DbMercado.Infrastructure --startup-project DbMercado.Api
dotnet ef database update --project DbMercado.Infrastructure --startup-project DbMercado.Api

# Frontend — dev
npm run dev

# Frontend — build
npm run build
```

---

## 12. O que NÃO fazer

### Backend
- ❌ Connection string hardcoded
- ❌ Lógica de negócio em Controllers
- ❌ Entidades com setters públicos (exceto EF navigation props)
- ❌ Integrações externas no Domain
- ❌ Ignorar o middleware de exceções — sempre lançar `BusinessException`

### Frontend
- ❌ `bg-white` ou qualquer classe de tema claro
- ❌ Texto hardcoded em português no JSX (usar i18n)
- ❌ Importar de outro módulo (só de `shared/`)
- ❌ AG Grid com `clientSide` em listas de produção
- ❌ Ícones de outras bibliotecas além de `lucide-react`
- ❌ Criar novo componente sem consultar o DESIGN_SYSTEM.md
