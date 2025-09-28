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
   When developing inside a container/VM and you need to open the app from another process
   (for example Playwright or the browser tooling used for screenshots), expose the dev
   server by adding `--host 0.0.0.0`:
   ```bash
   npm run dev -- --mode msw --host 0.0.0.0
   ```
3. Change the default mock account by editing `VITE_MSW_ACCOUNT` (`ADMIN`, `SELLER`, or `CUSTOMER`). Restart the dev server after changing the value.

### Default development accounts

| Role preset | Username | Password | Email | Notes |
|-------------|----------|----------|-------|-------|
| `ADMIN`     | `admin`  | `admin123`    | `admin@tokopaedi.test`    | Full access, matches IAM seed role `ADMIN`. |
| `SELLER`    | `seller` | `seller123`   | `seller@tokopaedi.test`   | Has roles `SELLER` + `CUSTOMER`, owns **Seller Central Store**. |
| `CUSTOMER`  | `customer` | `customer123` | `customer@tokopaedi.test` | Default when `VITE_MSW_ACCOUNT` is omitted. |

> **Note:** Playwright E2E tests always launch the dev server without MSW through `scripts/dev-no-msw.mjs`. The tests register
> their own service worker inside the browser context, so turning MSW on at the dev-server level leads to duplicate handlers
> and unreliable auth redirects.
>
> **Heads-up on workers:** the suite is intentionally serial. Forcing `PLAYWRIGHT_WORKERS` to a value greater than `1`
> makes multiple browsers mutate the shared MSW mock state at the same time. When that happens, the auth guard no longer
> sees the expected access token and the RBAC specs redirect to `/login` instead of `/403`. Leave the worker count at the
> default (`1`) when running locally or from IntelliJ.

### Running the Playwright E2E suite

Run the suite through the provided npm script so Playwright can boot the dev server with the `scripts/dev-no-msw.mjs`
helper. Keep the worker count at `1` and pass the same MSW account configuration you use during local development so
the tests exercise the correct seeded profile data:

```bash
PLAYWRIGHT_WORKERS=1 \
VITE_API_BASE_URL=http://localhost:18080 \
VITE_MSW_ACCOUNT=CUSTOMER \
VITE_USE_MSW=true \
npm run test:e2e
```

These environment variables match the defaults used by the IntelliJ `Playwright_E2E_Tests.xml` run configuration and
ensure the RBAC and profile scenarios stay green.

The mock data mirrors the backend seed data:

- Fixed UUIDs for each account and their profile information.
- IAM role/permission mapping aligned with the provided seed (catalog/profile permissions).
- Profile service returns the seeded store for the seller account and allows CRUD operations locally.
- Auth refresh endpoint keeps the chosen account logged in so gated pages remain accessible for UI work and screenshots.

### Capturing UI screenshots in mock mode

- Open the dev server with MSW enabled as shown above (include `--host 0.0.0.0` when running
  inside a container so automation tools can reach it).
- Navigate directly to protected routes such as `/profile`—the selected mock account is already
  authenticated, so modals like the avatar cropper can be opened without a real backend.
- Use your preferred tooling (Playwright, browser devtools, etc.) to trigger UI interactions and
  take screenshots for design reviews or regression evidence.

When MSW is enabled, network calls that are not mocked are passed through to the real backend (if available).
