# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## OpenAPI Codegen (Contract-First)

- Specs (client contract):
  - `openapi/catalog.yaml` — product list contract (Spring-style page)
  - `openapi/iam.yaml` — current user contract
- Generated outputs (do not edit):
  - Types: `src/generated/openapi/**/types.ts` (via `openapi-typescript`)
  - Schemas: `src/generated/openapi/**/schemas.ts` (Zod schemas, schemas-only)
- Scripts:
  - `npm run gen:openapi:catalog` → regenerate catalog types + Zod schemas
  - `npm run gen:openapi:iam` → regenerate IAM types + Zod schemas
  - `npm run gen:openapi:all` → run both
- Implementation notes:
  - Services import types from `types.ts` for compile-time safety.
  - Services validate responses with Zod from `schemas.ts` at runtime.
  - We strip zodios client from `openapi-zod-client` output (see `scripts/gen-ozc-schemas-only.mjs`), avoiding extra runtime deps.
  - Update the YAML specs, then re-run the gen scripts. Commit both specs and generated files.

## Local Mock Backend (MSW)

The project ships with a Mock Service Worker setup so you can run the frontend without a live backend.

1. Copy `.env.example` to `.env.local` (optional) and tweak if needed.
2. Start the dev server with the MSW mode:
   ```bash
   npm run dev -- --mode msw
   ```
   This loads `.env.msw`, sets `VITE_USE_MSW=true`, and automatically signs you in with a mock account.
3. Change the default mock account by editing `VITE_MSW_ACCOUNT` (`ADMIN`, `SELLER`, or `CUSTOMER`). Restart the dev server after changing the value.

### Default development accounts

| Role preset | Username | Password | Email | Notes |
|-------------|----------|----------|-------|-------|
| `ADMIN`     | `admin`  | `admin123`    | `admin@tokopaedi.test`    | Full access, matches IAM seed role `ADMIN`. |
| `SELLER`    | `seller` | `seller123`   | `seller@tokopaedi.test`   | Has roles `SELLER` + `CUSTOMER`, owns **Seller Central Store**. |
| `CUSTOMER`  | `customer` | `customer123` | `customer@tokopaedi.test` | Default when `VITE_MSW_ACCOUNT` is omitted. |

The mock data mirrors the backend seed data:

- Fixed UUIDs for each account and their profile information.
- IAM role/permission mapping aligned with the provided seed (catalog/profile permissions).
- Profile service returns the seeded store for the seller account and allows CRUD operations locally.
- Auth refresh endpoint keeps the chosen account logged in so gated pages remain accessible for UI work and screenshots.

When MSW is enabled, network calls that are not mocked are passed through to the real backend (if available).
