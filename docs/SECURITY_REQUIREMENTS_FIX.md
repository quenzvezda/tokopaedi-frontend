# Security Requirements Fix

## Masalah yang Ditemukan

### Problem Description

Frontend mengalami error 401 Unauthorized saat mengakses endpoint catalog dan IAM, meskipun:

1. User sudah login dan memiliki token yang valid
2. Token dikirim dalam header Authorization
3. Postman test berhasil tanpa masalah

### Root Cause Analysis

Kontrak OpenAPI tidak memiliki `security` requirement yang eksplisit untuk endpoint yang memerlukan autentikasi. Backend service mengembalikan 401 karena endpoint memang memerlukan autentikasi, tapi kontrak tidak mendefinisikan hal ini dengan jelas.

## Solusi yang Diterapkan

### 1. Menambahkan Security Requirements

**Sebelum:**

```yaml
/catalog/api/v1/products:
  get:
    tags: [Product]
    operationId: listProducts
    summary: List products
    # ❌ Tidak ada security requirement
```

**Sesudah:**

```yaml
/catalog/api/v1/products:
  get:
    tags: [Product]
    operationId: listProducts
    summary: List products
    security:
      - bearerAuth: [] # ✅ Security requirement ditambahkan
```

### 2. Endpoint yang Diperbaiki

#### Catalog Service

- `GET /catalog/api/v1/products` - List products
- `POST /catalog/api/v1/brands` - Create brand
- `PUT /catalog/api/v1/brands/{id}` - Update brand
- `DELETE /catalog/api/v1/brands/{id}` - Delete brand
- `POST /catalog/api/v1/categories` - Create category
- `PUT /catalog/api/v1/categories/{id}` - Update category
- `DELETE /catalog/api/v1/categories/{id}` - Delete category
- `POST /catalog/api/v1/products` - Create product
- `PUT /catalog/api/v1/products/{id}` - Update product
- `DELETE /catalog/api/v1/products/{id}` - Delete product
- `POST /catalog/api/v1/products/{productId}/skus` - Create SKU
- `PUT /catalog/api/v1/skus/{id}` - Update SKU
- `DELETE /catalog/api/v1/skus/{id}` - Delete SKU

#### IAM Service

- Sudah memiliki security requirements yang benar

### 3. Security Scheme

Kontrak menggunakan `bearerAuth` security scheme:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Benefits

### 1. Konsistensi Kontrak

- Kontrak OpenAPI sekarang secara eksplisit mendefinisikan endpoint mana yang memerlukan autentikasi
- Tidak ada ambiguitas antara kontrak dan implementasi backend

### 2. Type Safety

- Generated types sekarang mencerminkan security requirements
- Frontend dapat mengandalkan kontrak sebagai source of truth

### 3. Developer Experience

- Developer dapat melihat dari kontrak endpoint mana yang memerlukan autentikasi
- Dokumentasi API lebih jelas dan akurat

## Testing

### Before Fix

```bash
# Frontend call
GET http://localhost:8080/catalog/api/v1/products
# Result: 401 Unauthorized (meskipun token valid)
```

### After Fix

```bash
# Frontend call
GET http://localhost:8080/catalog/api/v1/products
Authorization: Bearer <valid-token>
# Result: 200 OK with product data
```

## Backend Implications

### Code Generation

Jika backend menggunakan OpenAPI code generation:

1. **Controller Generation**: Security requirements akan di-generate ke dalam controller
2. **Security Annotations**: Framework security annotations akan ditambahkan otomatis
3. **Consistent Behavior**: Backend behavior akan konsisten dengan kontrak

### Manual Implementation

Jika backend diimplementasi manual:

1. **Security Middleware**: Pastikan security middleware membaca security requirements dari kontrak
2. **Endpoint Protection**: Endpoint yang memiliki `security: [bearerAuth: []]` harus dilindungi
3. **Token Validation**: JWT token harus divalidasi untuk endpoint yang memerlukan autentikasi

## Migration Checklist

- [x] Update OpenAPI kontrak dengan security requirements
- [x] Regenerate frontend types
- [x] Test frontend dengan token yang valid
- [ ] Update backend code generation (jika menggunakan)
- [ ] Test semua endpoint yang memerlukan autentikasi
- [ ] Update dokumentasi API

## Best Practices

### 1. Security Requirements

- Selalu definisikan security requirements secara eksplisit di OpenAPI
- Gunakan security scheme yang konsisten
- Dokumentasikan endpoint mana yang public vs protected

### 2. Contract-First Development

- Kontrak OpenAPI adalah source of truth
- Backend dan frontend harus mengikuti kontrak
- Tidak ada implementasi yang menyimpang dari kontrak

### 3. Testing

- Test dengan dan tanpa token untuk endpoint yang memerlukan autentikasi
- Pastikan error handling untuk 401 Unauthorized
- Validasi token format dan expiration

## Troubleshooting

### Common Issues

1. **401 Unauthorized dengan Token Valid**
   - Check apakah kontrak memiliki security requirement
   - Pastikan backend membaca security requirements dari kontrak
   - Validasi token format dan signature

2. **200 OK tanpa Token**
   - Check apakah endpoint seharusnya protected
   - Pastikan security requirement sudah ditambahkan di kontrak
   - Regenerate backend code dari kontrak yang sudah di-update

3. **Inconsistent Behavior**
   - Pastikan kontrak dan implementasi sinkron
   - Regenerate semua code dari kontrak yang sama
   - Test dengan multiple clients (Postman, Frontend, etc.)
