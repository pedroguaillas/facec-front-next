# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 (App Router) frontend with React 19, connecting to a Laravel 12 backend API. Originally migrated from Create React App + Laravel Lumen 10. Uses pnpm as package manager.

## Commands

- `pnpm dev` — Dev server with Turbopack
- `pnpm build` — Production build
- `pnpm start` — Start production server
- `pnpm lint` — ESLint

## Architecture

### Routing

App Router with grouped routes under `app/(route)/`. Each feature (customers, suppliers, products, shops, orders, carriers, referralguides, reports, settings, admin) follows the pattern:

```
app/(route)/[feature]/
  page.tsx              # List page
  create/page.tsx       # Create page
  [id]/page.tsx         # Detail/edit page
  components/           # Feature-specific components
  context/              # Feature context providers (useReducer + Context API)
  services/             # Feature-specific API services
  hooks/                # Feature-specific hooks
  shared/               # Shared feature components (forms)
```

### API & Services

All HTTP calls use Axios. Two instances exist in `lib/axios.ts`: a plain `axios` and `axiosAuth` (with auth interceptors).

Service functions follow this signature pattern:
```typescript
export const getResource = async (
  axiosAuth: AxiosInstance,
  id: string,
): Promise<ApiResponse<ResourceType>> =>
  handleApiRequest<ResourceType>(() => axiosAuth.get(`endpoint/${id}`));
```

- Global services live in `/services/` (cross-feature)
- Feature services live in `app/(route)/[feature]/services/`
- `handleApiRequest()` in `helpers/apiHandler.ts` wraps all calls, catching 422 validation errors from Laravel
- `ApiResponse<T>` type (in `types/api.d.ts`) returns `{ data?, error?, errors? }`

### Authentication

NextAuth.js v4 with Credentials provider and JWT strategy. `useAxiosAuth()` hook (in `lib/hooks/`) adds Bearer token to requests via Axios interceptors. Session provider wraps the app in `context/Provider.tsx`.

### Forms & Validation

- Zod schemas in `/schemas/` for client-side validation
- `useFormSubmit()` hook for form submission with Zod
- Server validation errors (Laravel 422) handled via `handleApiRequest()`
- Error type: `Partial<Record<keyof EntityType, string>>`
- Complex forms use `useReducer` in feature contexts (e.g., `FormShopContext`)

### State Management

React Context API + custom hooks (no Redux). Pattern: Provider exports a custom hook (`useCustomers`, `useFormShop`) to access context. Root provider is just NextAuth's `SessionProvider`.

### Styling

Tailwind CSS v4 with PostCSS. Custom theme colors via CSS custom properties in `globals.css`. Dark mode via `prefers-color-scheme`.

### Types

TypeScript types in `/types/` as `.d.ts` files, all re-exported from `types/index.ts`. Path alias `@/*` maps to project root.

## Key Configuration

- `reactStrictMode: false` in next.config.ts
- `output: "standalone"` for containerized deployment
- Environment variables: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`

## Key Directories

- `/components` — Reusable UI components (alert, dialog, text-input, table-responsive, paginate, selects, modal)
- `/helpers` — apiHandler, zodHelper, dateHelper
- `/constants` — initialValues, codeErrors, voucherTypes
- `/lib` — Auth config, Axios instances, shared hooks
