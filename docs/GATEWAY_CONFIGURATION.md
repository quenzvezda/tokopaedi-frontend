# Gateway Configuration & OpenAPI Best Practices

## Overview

Dokumen ini menjelaskan best practice untuk konfigurasi gateway dan OpenAPI kontrak di Tokopaedi Frontend.

## Prinsip Dasar

### 1. OpenAPI sebagai Source of Truth

✅ **DO:**

- OpenAPI kontrak adalah satu-satunya sumber kebenaran untuk API endpoints
- Semua path API didefinisikan lengkap di OpenAPI kontrak
- Service layer menggunakan path langsung dari kontrak

❌ **DON'T:**

- Jangan hardcode path di service layer
- Jangan menggunakan base path terpisah di environment variables
- Jangan mencampur konfigurasi path di multiple tempat

### 2. Struktur URL yang Konsisten

**Pattern yang digunakan:**

```
http://localhost:8080/{service}/api/v1/{resource}
```

**Contoh:**

- Auth: `GET /auth/api/v1/login`
- Catalog: `GET /catalog/api/v1/products`
- IAM: `GET /iam/api/v1/users/me`

## Konfigurasi Gateway

### Environment Variables

```bash
# Gateway base URL
VITE_API_BASE_URL=http://localhost:8080

# Fallback untuk kompatibilitas
VITE_GATEWAY_BASE=http://localhost:8080
```

### OpenAPI Server Configuration

Setiap kontrak OpenAPI mendefinisikan server URLs:

```yaml
servers:
  - url: http://localhost:8080
    description: Development Gateway
  - url: https://api.tokopaedi.com
    description: Production Gateway
```

## Konfigurasi Backend Services

### Gateway Routing Rules

Gateway harus dikonfigurasi untuk route berdasarkan path pattern:

```yaml
# application.yml untuk Gateway
spring:
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/auth/**
          # No StripPrefix: service handles /auth context-path itself

        - id: catalog-service
          uri: lb://catalog-service
          predicates:
            - Path=/catalog/**
          # No StripPrefix: service handles /catalog context-path itself

        - id: iam-service
          uri: lb://iam-service
          predicates:
            - Path=/iam/**
          # No StripPrefix: service handles /iam context-path itself
```

### Service Context Path

Setiap microservice **HARUS** mengatur context path sesuai dengan service name:

```yaml
# ✅ DO - Set context path sesuai service name
# Auth Service
server:
  port: 9000
  servlet:
    context-path: /auth

# Catalog Service
server:
  port: 9001
  servlet:
    context-path: /catalog

# IAM Service
server:
  port: 9002
  servlet:
    context-path: /iam
```

## Frontend Implementation

### Service Layer Pattern

```typescript
// ✅ DO - Gunakan path langsung dari OpenAPI
export async function listProductsService(params: ProductListParams) {
  const res = await http.get('/catalog/api/v1/products', { params })
  return parseProductPage(res.data)
}

// ❌ DON'T - Jangan gunakan base path terpisah
const CATALOG_BASE = '/api/catalog/v1' // Hapus ini
const res = await http.get(`${CATALOG_BASE}/products`, { params })
```

### Fetcher Configuration

```typescript
// Gateway base URL saja
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const http: AxiosInstance = axios.create({
  baseURL, // Hanya base URL, path lengkap dari OpenAPI
  headers: {
    'Content-Type': 'application/json',
  },
})
```

## Benefits dari Approach Ini

### 1. Single Source of Truth

- Semua endpoint didefinisikan di satu tempat (OpenAPI)
- Tidak ada duplikasi konfigurasi path
- Mudah maintenance dan update

### 2. Environment Flexibility

- Gateway URL bisa berbeda per environment
- Path API tetap konsisten
- Mudah switch antara dev/staging/prod

### 3. Type Safety

- Generated types dari OpenAPI
- Compile-time validation
- Auto-completion di IDE

### 4. Gateway Simplicity

- Gateway hanya perlu routing berdasarkan path
- Tidak perlu complex path manipulation
- Service tetap simple tanpa context path

## Migration Guide

### Dari Konfigurasi Lama

**Sebelum:**

```typescript
// Service layer
const CATALOG_BASE = '/api/catalog/v1'
const res = await http.get(`${CATALOG_BASE}/products`)

// OpenAPI
servers:
  - url: /
paths:
  /api/v1/products:  # Inconsistent
```

**Sesudah:**

```typescript
// Service layer
const res = await http.get('/catalog/api/v1/products')

// OpenAPI
servers:
  - url: /
paths:
  /catalog/api/v1/products:  # Consistent
```

### Checklist Migration

- [ ] Update OpenAPI server URLs
- [ ] Standardize semua path dengan pattern `/{service}/api/v1/{resource}`
- [ ] Remove hardcoded base paths di service layer
- [ ] Update gateway routing rules
- [ ] Set context path di service `application.yml` sesuai service name
- [ ] Regenerate types dari OpenAPI
- [ ] Update tests

## Troubleshooting

### Common Issues

1. **404 Not Found**
   - Pastikan gateway routing rules sesuai dengan path pattern
   - Check apakah service context path sudah dihapus

2. **CORS Issues**
   - Pastikan gateway mengatur CORS untuk semua services
   - Check apakah frontend URL sudah di-whitelist

3. **Type Mismatch**
   - Regenerate types setelah update OpenAPI
   - Pastikan schema validation sesuai dengan response

### Debug Tips

```bash
# Check gateway routes
curl -X GET http://localhost:8080/actuator/gateway/routes

# Test service langsung (bypass gateway)
curl -X GET http://localhost:8081/products

# Test via gateway
curl -X GET http://localhost:8080/catalog/api/v1/products
```
