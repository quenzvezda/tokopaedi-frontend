# Tokopaedi Frontend — Agent Guide

Dokumen ini adalah panduan operasional untuk agent coding dan kontributor manusia. Isinya merangkum arsitektur, konvensi, dan acceptance criteria yang menjadi acuan implementasi dan review.

Cara pakai singkat:

- Baca setiap bagian Do/Don’t sebelum menulis kode.
- Gunakan Acceptance Criteria sebagai checklist kerja/PR.
- Perbaharui bagian ini hanya jika ada keputusan arsitektur baru.

---

## 1) Tujuan & Ruang Lingkup

**Do**

- Tetapkan React + Vite dengan pendekatan feature-based, fokus pada kesederhanaan.
- Pisahkan UI dari logic (hooks/services/api).
- Gunakan server state yang kuat, client state tetap ringan.

**Don’t**

- Jangan over-engineer layer dan abstraksi.
- Jangan mencampur banyak style system.

**Acceptance Criteria**

- [ ] Proyek React + Vite terinisialisasi dengan TypeScript.
- [ ] Tersedia struktur feature-based.
- [ ] Server state dikelola React Query; client state lokal/zustand hanya bila perlu.

---

## 2) Tumpukan Teknologi (Standar)

**Do**

- Vite, React, TypeScript.
- React Router untuk routing.
- TanStack Query untuk server state.
- React Hook Form + Zod untuk form & validasi.
- Chakra UI sebagai satu-satunya styling system.
- Vitest + React Testing Library (unit/component), Playwright (E2E).
- MSW untuk mocking API saat test.
- ESLint + Prettier, Husky + lint-staged untuk kualitas kode.

**Don’t**

- Jangan pakai Redux kecuali sangat perlu.
- Jangan menulis wrapper HTTP berlapis-lapis.

**Acceptance Criteria**

- [ ] Dependensi inti terpasang.
- [ ] Package manager standar adalah **npm**.
- [ ] Skrip npm tersedia: `dev`, `build`, `test`, `test:e2e`, `typecheck`, `lint`.
- [ ] Husky hook: pre-commit (lint-staged), pre-push (typecheck+test).

---

## 3) Struktur Proyek (Feature-Based)

**Do**

- Kelompokkan per fitur: `features/<nama>/{components,hooks,api,services,pages,types}`.
- Sediakan `features/<nama>/index.ts` sebagai surface publik.
- `app/` untuk providers, routes, config; `shared/` untuk utilitas generik.

**Don’t**

- Jangan menaruh semua komponen global di satu folder `components/` tanpa konteks fitur.
- Jangan membuat dependencies silang antar-fitur tanpa melalui `index.ts`.

**Acceptance Criteria**

- [ ] Folder `app/`, `shared/`, `features/` tercipta dengan isi minimal.
- [ ] Alias `@/` menunjuk ke `src/`.
- [ ] Tiap fitur punya `index.ts` dan minimal satu page/komponen.

---

## 4) Konvensi Kode

**Do**

- TypeScript strict, hindari `any`.
- Penamaan: komponen `PascalCase.tsx`, hooks `useX.ts`.
- Komentar hanya untuk business rule atau sintaks jarang.

**Don’t**

- Jangan menambah temporary variables yang tidak perlu.
- Jangan menulis komentar untuk hal self-explanatory.

**Acceptance Criteria**

- [ ] `tsconfig` strict.
- [ ] ESLint rules untuk hooks dan import/order aktif.
- [ ] Tidak ada `any` tanpa alasan kuat.

---

## 5) Data Fetching (CQRS di Frontend)

**Do**

- Query: `useQuery` per resource dengan cache key jelas.
- Command: `useMutation` dan invalidasi cache yang relevan.
- Global error handling via `QueryClient` + UI feedback.
- Validasi response dengan Zod (pada boundary service/API).

**Don’t**

- Jangan mencampur client state dan server state.
- Jangan melakukan re-fetch tanpa alasan; gunakan caching/invalidation.

**Acceptance Criteria**

- [ ] Minimal satu `useQuery` dan satu `useMutation` di fitur autentikasi.
- [ ] Invalidasi cache setelah login/logout atau perubahan data.
- [ ] Skema Zod untuk payload kritikal.

---

## 6) Layer API & DTO

**Do**

- `shared/lib/fetcher.ts`: wrapper tipis (baseURL, header auth, JSON, error normalization).
- `features/<x>/services`: mapping DTO⇄Model + validasi (Zod).
- `features/<x>/api`: hooks React Query (`useGetX`, `useCreateX`, dst.).

**Don’t**

- Jangan menaruh call `fetch` langsung di komponen.
- Jangan menyebar baseURL/hardcode path di banyak tempat.

**Acceptance Criteria**

- [ ] Satu fetcher reusable tersedia.
- [ ] Service layer memetakan DTO dan memvalidasi data.
- [ ] API hooks mengonsumsi service, tidak langsung `fetch`.

---

## 7) Routing & Code Splitting

**Do**

- Definisikan routes di `app/routes` dan gunakan `lazy(() => import(...))`.
- Sediakan loading state dan error boundary per-route.

**Don’t**

- Jangan memuat semua halaman eager-load.

**Acceptance Criteria**

- [ ] Lazy load minimal pada halaman `Login`/`Dashboard`.
- [ ] Loading skeleton pada page-level.

---

## 8) UI & Styling

**Do**

- Gunakan Chakra UI secara konsisten sebagai satu-satunya sistem styling.
- Komponen UI generik di `shared/ui` (Button, Input) dapat me-reexport komponen Chakra untuk konsistensi import.

**Don’t**

- Jangan campur Chakra UI dengan CSS-in-JS lain, Tailwind, atau CSS Modules sekaligus.

**Acceptance Criteria**

- [ ] `shared/ui/Button.tsx` dan `shared/ui/Input.tsx` tersedia (re-export Chakra).
- [ ] Style konsisten tanpa campur metode styling.

---

## 9) Error, Empty, Loading States

**Do**

- Setiap page: loading (skeleton), empty (pesan), error (pesan + retry).
- Global `ErrorBoundary` di providers.

**Don’t**

- Jangan menelan error network tanpa feedback ke user.

**Acceptance Criteria**

- [ ] `ErrorBoundary` terpasang global.
- [ ] Komponen menampilkan state error/loading dengan jelas.

---

## 10) Performance Ringkas

**Do**

- Code splitting per page/route.
- `React.memo` untuk list item berat; `useMemo/useCallback` bila perlu.

**Don’t**

- Jangan melakukan premature optimization.

**Acceptance Criteria**

- [ ] Bundle di-split per halaman utama.
- [ ] Tidak ada memoization yang tidak berdampak (lint/perf check lulus).

---

## 11) Testing Strategy (Unit vs E2E)

**Do**

- Gunakan **keduanya** secara proporsional (test pyramid).
- Unit/Component (Vitest + RTL): logic, hooks, form validasi.
- E2E (Playwright): smoke (home, navigasi, login, logout) + 1–2 alur kritikal.

**Don’t**

- Jangan menulis E2E untuk semua skenario UI kecil.
- Jangan biarkan test E2E bergantung pada data tidak deterministik.

**Acceptance Criteria**

- [ ] Suite unit/component untuk `useLogin` dan `LoginForm`.
- [ ] Suite E2E: login berhasil & gagal, lalu logout (smoke).
- [ ] MSW aktif untuk unit/component tests; E2E bisa MSW scenario/staging.

---

## 12) Otentikasi

**Do**

- Pakai cookie httpOnly/secure untuk sesi bila backend mendukung; token via header di fetcher.
- Simpan user minimal di React Query cache (`useCurrentUser`).
- Proteksi route privat dengan guard yang memeriksa user state.

**Don’t**

- Jangan simpan token di localStorage jika bisa dihindari.
- Jangan jadikan global store sebagai sumber kebenaran user state.

**Acceptance Criteria**

- [ ] `useCurrentUser` tersedia dan dipakai di guard.
- [ ] Route privat redirect ke login bila tidak autentik.

---

## 13) Konfigurasi & Env

**Do**

- Gunakan `import.meta.env` (prefix `VITE_`).
- Sediakan `.env.example`.

**Don’t**

- Jangan commit rahasia.

**Acceptance Criteria**

- [ ] Variabel lingkungan dibaca dari `VITE_API_BASE_URL` (contoh).
- [ ] `.env.example` berisi key yang diperlukan.

---

## 14) Kualitas Kode & CI

**Do**

- ESLint + Prettier; aturan hooks & import/order aktif.
- Husky + lint-staged (format+lint hanya pada file berubah).
- (Opsional sementara) CI menjalankan typecheck, unit, subset E2E smoke, dan build.

**Don’t**

- Jangan merge PR tanpa lint & test lulus.

**Acceptance Criteria**

- [ ] Pipeline CI: `typecheck`, `test`, `test:e2e:ci` (smoke), `build`. (Ditunda: lokal-only)
- [ ] Pre-commit/pre-push hooks aktif.

---

## 15) Integrasi Microservice (Frontend)

**Do**

- Idealnya konsumsi via BFF/API Gateway; jika belum, standarkan error shape dan versioning endpoint.
- Kontrak diketikkan (OpenAPI → types, atau Zod schema).
- Adapter di `services` agar UI stabil saat kontrak berubah.

**Don’t**

- Jangan panggil banyak microservice langsung dari komponen.
- Jangan hardcode error shape berbeda-beda per service.

**Acceptance Criteria**

- [ ] Error shape distandarkan (kode & message).
- [ ] Tipe/Schema respons dihasilkan/ditulis konsisten.
- [ ] Perubahan kontrak backend butuh update tipis di `services` saja.

---

## 16) Penamaan & Letak Berkas Uji

**Do**

- Simpan test dekat fitur:

  - `src/features/auth/__tests__/useLogin.test.ts`
  - `src/features/auth/__tests__/LoginForm.test.tsx`
- E2E terpisah di `e2e/`: `e2e/auth.login.spec.ts`.

**Don’t**

- Jangan mencampur unit/component test dengan E2E dalam satu folder.

**Acceptance Criteria**

- [ ] Struktur pengujian mengikuti pola di atas.
- [ ] Perintah test unit dan E2E terpisah jelas.

---

## 17) Non-Goals

**Do**

- Dokumentasikan hal yang sengaja tidak dilakukan (Redux, arsitektur berat).

**Don’t**

- Jangan menambahkan tool baru tanpa alasan yang kuat.

**Acceptance Criteria**

- [ ] Bagian Non-Goals tercantum di `agent.md`.

---

## Lampiran A — Quick Start (untuk Agent)

- **Gunakan `npm` sebagai package manager.** Jalankan `npm install` untuk menginstal dependensi.
- Skrip yang disediakan dijalankan dengan `npm run <nama-skrip>`, contoh: `npm run dev`.
- Pastikan `.env.example` terisi dan salin menjadi `.env.*` sesuai environment.
- Struktur dasar src: `app/`, `shared/`, `features/`.

## Lampiran B — Prinsip PR & Review

- Sertakan checklist Acceptance Criteria terkait fitur.
- Tunjukkan perubahan pada `services`/`api` ketimbang langsung ke komponen.
- Hindari perubahan global yang tidak perlu pada PR fitur.

---

## 18) OpenAPI Docs & Generation

**Do**

- Gunakan OpenAPI JSON dari Gateway aggregator untuk tipe/skema otomatis.
- Prefer `openapi-zod-client` (Zod + TS) atau `openapi-typescript` (TS only).
- Simpan hasil generate di folder khusus (mis. `src/generated/openapi/<group>`), jangan modifikasi manual.
- Tambahkan skrip npm untuk generate: `gen:openapi:iam`, `gen:openapi:catalog`, `gen:openapi:all`.

**Info (Dev / Lokal)**

- JSON endpoints tersedia via Gateway:
  - `http://localhost:8080/iam/v3/api-docs`
  - `http://localhost:8080/catalog/v3/api-docs`
- Swagger UI aggregator: `http://localhost:8080/webjars/swagger-ui/index.html?urls.primaryName=iam`

**Don't**

- Jangan mengandalkan parsing HTML Swagger UI untuk otomatisasi; gunakan JSON langsung.

**Acceptance Criteria**

- [ ] (TODO) Skrip generator OpenAPI ditambahkan (iam, catalog, all).
- [ ] (TODO) Refactor `features/catalog/services` memakai tipe/skema hasil generate.
- [ ] (Optional) Tambahkan README singkat cara pakai generator.

---

## Lampiran C — Menjalankan E2E Test

- Jalankan `npm install` untuk memasang dependensi.
- Unduh browser Playwright sekali saja dengan `npx playwright install`.
- Beberapa test memakai helper dev-only `__setAccessToken`, pastikan mode dev aktif.
- Dev server harus berjalan. Konfigurasi `webServer` di `playwright.config.ts` akan memulai `npm run dev` otomatis, atau jalankan manual sebelum `npm run test:e2e`.
