# Arquitetura do front-end administrativo (React)

Este projeto está organizado para o **painel administrativo** da plataforma, alinhado aos bounded contexts do backend .NET.

## 1) Árvore de pastas (`src/`)

```
src/
├── app/                    # Composição da aplicação (roteamento raiz)
│   ├── App.js
│   └── routes/
│       └── AppRoutes.js
├── design-system/          # Tokens, tema global (sem biblioteca de componentes pesada)
│   ├── tokens.css
│   └── global.css
├── integrations/         # Adaptadores externos (HTTP, futuros SDKs)
│   └── api/
│       ├── config.js       # VITE_API_BASE_URL / fallback localhost
│       └── httpClient.js
├── modules/                # Domínios de negócio (feature folders)
│   ├── auth/               # Login, JWT localStorage, authService
│   ├── dashboard/
│   ├── users/
│   ├── roles/
│   ├── audit/
│   ├── products/         # Placeholder — Marketplace
│   ├── orders/             # Placeholder — Pedidos
│   ├── inventory/          # Placeholder — Logística / estoque
│   └── billing/            # Placeholder — Financeiro
└── shared/                 # Transversal à UI admin (não é “domínio”)
    ├── components/
    │   ├── guards/         # PrivateRoute
    │   ├── layouts/        # AdminLayout, Sidebar, Topbar, Breadcrumb
    │   └── PlaceholderPage.js
    └── (hooks, utils — evoluir aqui)
```

## 2) Separação por domínio

| Pasta | Responsabilidade |
|--------|-------------------|
| **`modules/*`** | Tudo que pertence a um **módulo de produto**: páginas, serviços do módulo (ex.: `auth` com `authService`). Cada pasta deve poder evoluir para subpastas `components/`, `hooks/`, `services/` sem misturar outro contexto. |
| **`shared/`** | O que **vários módulos** usam: layout administrativo, guard de rota, placeholders genéricos. Evite colocar regra de negócio de um único módulo aqui. |
| **`integrations/`** | Contato com o **mundo externo** (API REST). Não contém telas nem estado de “usuário”; só config e clientes HTTP. |
| **`design-system/`** | **Tokens visuais** e reset global. Base para evoluir para componentes reutilizáveis (botões, inputs) sem acoplar a um módulo. |
| **`app/`** | **Orquestração**: router, montagem do `BrowserRouter`. Não implementa features. |

### Mapeamento com o backend (visão futura)

- **auth** ↔ autenticação JWT / Identity  
- **users** ↔ cadastro administrativo de usuários  
- **roles** ↔ módulos, funcionalidades, permissões (claims)  
- **audit** ↔ logs e auditoria  
- **products / orders / inventory / billing** ↔ rotas e módulos reservados para os contextos Marketplace, Pedidos, Logística e Financeiro  

## 3) Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para `/login` ou `/admin/dashboard` conforme sessão |
| `/login` | Login administrativo |
| `/dashboard` | Redireciona para `/admin/dashboard` (compatibilidade) |
| `/admin/*` | Área autenticada com `AdminLayout` (sidebar + topbar + breadcrumb) |

## 4) Variáveis de ambiente

- `VITE_API_BASE_URL` ou `VITE_DOTNET_API_BASE_URL` — URL base da API .NET (padrão `http://localhost:5046`).

## 5) Comportamento preservado

- Login via `POST /api/Auth/login`, armazenamento de `jwt_token` e `jwt_expiration` no `localStorage`, checagem em rotas privadas e logout limpando o storage.
