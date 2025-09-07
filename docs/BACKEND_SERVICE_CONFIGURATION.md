# Backend Service Configuration

## Overview

Dokumen ini menjelaskan konfigurasi yang diperlukan untuk setiap microservice setelah refaktor OpenAPI kontrak.

## Service Configuration

### 1. Auth Service

**application.yml:**

```yaml
server:
  port: 9000
  servlet:
    context-path: /auth

spring:
  application:
    name: auth-service
```

**Generated Endpoints:**

- `POST /auth/api/v1/login`
- `POST /auth/api/v1/register`
- `POST /auth/api/v1/refresh`
- `POST /auth/api/v1/logout`
- `GET /.well-known/jwks.json`

### 2. Catalog Service

**application.yml:**

```yaml
server:
  port: 9001
  servlet:
    context-path: /catalog

spring:
  application:
    name: catalog-service
```

**Generated Endpoints:**

- `GET /catalog/api/v1/brands`
- `POST /catalog/api/v1/brands`
- `PUT /catalog/api/v1/brands/{id}`
- `DELETE /catalog/api/v1/brands/{id}`
- `GET /catalog/api/v1/categories`
- `POST /catalog/api/v1/categories`
- `PUT /catalog/api/v1/categories/{id}`
- `DELETE /catalog/api/v1/categories/{id}`
- `GET /catalog/api/v1/products`
- `POST /catalog/api/v1/products`
- `PUT /catalog/api/v1/products/{id}`
- `DELETE /catalog/api/v1/products/{id}`
- `GET /catalog/api/v1/products/{slug}`
- `POST /catalog/api/v1/products/{productId}/skus`
- `PUT /catalog/api/v1/skus/{id}`
- `DELETE /catalog/api/v1/skus/{id}`

### 3. IAM Service

**application.yml:**

```yaml
server:
  port: 9002
  servlet:
    context-path: /iam

spring:
  application:
    name: iam-service
```

**Generated Endpoints:**

- `GET /iam/api/v1/users/me`
- `GET /iam/api/v1/permissions`
- `POST /iam/api/v1/permissions`
- `GET /iam/api/v1/permissions/{id}`
- `PUT /iam/api/v1/permissions/{id}`
- `DELETE /iam/api/v1/permissions/{id}`
- `GET /iam/api/v1/roles`
- `POST /iam/api/v1/roles`
- `GET /iam/api/v1/roles/{id}`
- `PUT /iam/api/v1/roles/{id}`
- `DELETE /iam/api/v1/roles/{id}`
- `POST /iam/api/v1/assign/role/{roleId}/permission/{permissionId}`
- `DELETE /iam/api/v1/assign/role/{roleId}/permission/{permissionId}`
- `POST /iam/api/v1/assign/user/{accountId}/role/{roleId}`
- `DELETE /iam/api/v1/assign/user/{accountId}/role/{roleId}`
- `POST /iam/api/v1/authz/check`
- `GET /iam/internal/v1/users/{accountId}/roles`
- `GET /iam/internal/v1/entitlements/{accountId}`

## Gateway Configuration

**application.yml:**

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
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

## URL Mapping

| Frontend Call                  | Gateway Route     | Service Endpoint               |
| ------------------------------ | ----------------- | ------------------------------ |
| `POST /auth/api/v1/login`      | `auth-service`    | `POST /auth/api/v1/login`      |
| `GET /catalog/api/v1/products` | `catalog-service` | `GET /catalog/api/v1/products` |
| `GET /iam/api/v1/users/me`     | `iam-service`     | `GET /iam/api/v1/users/me`     |

## Benefits

### 1. Clear Service Boundaries

- Setiap service memiliki namespace yang jelas
- Mudah diidentifikasi dari URL
- Tidak ada konflik path antar service

### 2. Simplified Gateway Routing

- Gateway hanya perlu route berdasarkan service name
- Tidak perlu complex path manipulation
- StripPrefix tidak diperlukan

### 3. Consistent Context Path

- Semua service menggunakan pattern yang sama
- Context path = service name
- Mudah di-maintain dan di-debug

## Testing

### Direct Service Access

```bash
# Auth Service
curl -X POST http://localhost:9000/auth/api/v1/login

# Catalog Service
curl -X GET http://localhost:9001/catalog/api/v1/products

# IAM Service
curl -X GET http://localhost:9002/iam/api/v1/users/me
```

### Via Gateway

```bash
# Auth Service
curl -X POST http://localhost:8080/auth/api/v1/login

# Catalog Service
curl -X GET http://localhost:8080/catalog/api/v1/products

# IAM Service
curl -X GET http://localhost:8080/iam/api/v1/users/me
```

## Migration Notes

1. **Update Service Context Path**: Setiap service harus mengatur context path sesuai service name
2. **Update Gateway Routes**: Gateway routing disederhanakan menjadi route berdasarkan service name
3. **No StripPrefix Needed**: Service menangani context path sendiri
4. **Consistent Port Assignment**: Setiap service menggunakan port yang berbeda untuk development

## OpenAPI Code Generation

Karena endpoint otomatis di-generate dari kontrak OpenAPI, pastikan:

1. **Kontrak OpenAPI** sudah menggunakan path dengan service prefix
2. **Code Generator** membaca kontrak yang sudah di-update
3. **Controller** di-generate sesuai dengan path di kontrak
4. **Context Path** di `application.yml` sesuai dengan service name

## Troubleshooting

### Common Issues

1. **404 Not Found**
   - Pastikan context path di service sesuai dengan service name
   - Check apakah gateway routing sudah benar

2. **Port Conflicts**
   - Pastikan setiap service menggunakan port yang berbeda
   - Check apakah service sudah running di port yang benar

3. **Path Mismatch**
   - Pastikan OpenAPI kontrak sudah di-update
   - Regenerate controller dari kontrak yang sudah di-update
