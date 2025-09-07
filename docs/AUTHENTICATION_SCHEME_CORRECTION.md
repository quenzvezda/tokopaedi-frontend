# Authentication Scheme Correction

## Masalah yang Ditemukan

### Problem Description

1. **Endpoint catalog products seharusnya public** (tidak memerlukan autentikasi)
2. **Sistem auth menggunakan HttpOnly cookies**, bukan Bearer token di header
3. **Kontrak OpenAPI tidak mencerminkan implementasi yang benar**

### Root Cause Analysis

- Kontrak OpenAPI menggunakan `bearerAuth` scheme yang tidak sesuai dengan implementasi backend
- Endpoint public (seperti list products) memiliki security requirement yang tidak perlu
- Sistem auth menggunakan cookies `refresh_token` untuk autentikasi

## Solusi yang Diterapkan

### 1. Menghapus Security Requirements dari Public Endpoints

**Catalog Service - Public Endpoints:**

```yaml
# ✅ Public endpoints (tidak memerlukan autentikasi)
/catalog/api/v1/products:
  get:
    tags: [Product]
    operationId: listProducts
    summary: List products
    # Tidak ada security requirement

/catalog/api/v1/brands:
  get:
    tags: [Brand]
    operationId: listBrands
    summary: List brands
    # Tidak ada security requirement

/catalog/api/v1/categories:
  get:
    tags: [Category]
    operationId: listCategories
    summary: List categories
    # Tidak ada security requirement
```

**Catalog Service - Protected Endpoints:**

```yaml
# ✅ Protected endpoints (memerlukan autentikasi)
/catalog/api/v1/brands:
  post:
    tags: [Brand]
    operationId: createBrand
    summary: Create brand
    security:
      - cookieAuth: [] # Memerlukan autentikasi

/catalog/api/v1/products:
  post:
    tags: [Product]
    operationId: createProduct
    summary: Create product
    security:
      - cookieAuth: [] # Memerlukan autentikasi
```

### 2. Mengubah Security Scheme dari Bearer Token ke Cookies

**Sebelum:**

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

**Sesudah:**

```yaml
components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: refresh_token
```

### 3. Update Security References

**IAM Service:**

```yaml
/iam/api/v1/users/me:
  get:
    tags: [User]
    operationId: getCurrentUser
    summary: Get current user profile
    security:
      - cookieAuth: [] # Menggunakan cookie auth
```

## Endpoint Classification

### Public Endpoints (No Authentication Required)

- `GET /catalog/api/v1/products` - List products
- `GET /catalog/api/v1/brands` - List brands
- `GET /catalog/api/v1/categories` - List categories
- `GET /catalog/api/v1/products/{slug}` - Get product by slug
- `POST /auth/api/v1/login` - Login
- `POST /auth/api/v1/register` - Register
- `GET /.well-known/jwks.json` - JWKS

### Protected Endpoints (Authentication Required)

- `GET /iam/api/v1/users/me` - Get current user
- `GET /iam/api/v1/permissions` - List permissions
- `POST /catalog/api/v1/brands` - Create brand
- `PUT /catalog/api/v1/brands/{id}` - Update brand
- `DELETE /catalog/api/v1/brands/{id}` - Delete brand
- `POST /catalog/api/v1/products` - Create product
- `PUT /catalog/api/v1/products/{id}` - Update product
- `DELETE /catalog/api/v1/products/{id}` - Delete product
- Dan semua endpoint CRUD lainnya

## Authentication Flow

### 1. Login Process

```http
POST /auth/api/v1/login
Content-Type: application/json

{
  "usernameOrEmail": "admin",
  "password": "password"
}
```

**Response:**

```http
HTTP/1.1 200 OK
Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Strict
Content-Type: application/json

{
  "tokenType": "Bearer",
  "accessToken": "<jwt-token>",
  "expiresIn": 3600
}
```

### 2. Authenticated Requests

```http
GET /iam/api/v1/users/me
Cookie: refresh_token=<token>
```

### 3. Public Requests

```http
GET /catalog/api/v1/products
# No authentication required
```

## Frontend Implementation

### Public API Calls

```typescript
// ✅ Tidak perlu mengirim cookie untuk public endpoints
export async function listProductsService(params: ProductListParams) {
  const res = await http.get('/catalog/api/v1/products', { params })
  return parseProductPage(res.data)
}
```

### Protected API Calls

```typescript
// ✅ Cookie otomatis dikirim oleh browser untuk protected endpoints
export async function getCurrentUserService(): Promise<CurrentUserDto> {
  const res = await http.get('/iam/api/v1/users/me')
  return parseCurrentUser(res.data)
}
```

### HTTP Client Configuration

```typescript
export const http: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Penting untuk mengirim cookies
})
```

## Testing

### Public Endpoints

```bash
# ✅ Should work without authentication
curl -X GET http://localhost:8080/catalog/api/v1/products

# ✅ Should work without authentication
curl -X GET http://localhost:8080/catalog/api/v1/brands
```

### Protected Endpoints

```bash
# ❌ Should return 401 without authentication
curl -X GET http://localhost:8080/iam/api/v1/users/me

# ✅ Should work with authentication
curl -X GET http://localhost:8080/iam/api/v1/users/me \
  -H "Cookie: refresh_token=<valid-token>"
```

## Backend Implications

### 1. Security Middleware

Backend harus mengimplementasikan:

- **Cookie-based authentication** untuk protected endpoints
- **Public access** untuk endpoints tanpa security requirement
- **JWT validation** dari cookie `refresh_token`

### 2. CORS Configuration

```yaml
# Gateway CORS configuration
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowed-origins: 'http://localhost:5173'
            allowed-methods: 'GET,POST,PUT,DELETE,OPTIONS'
            allowed-headers: '*'
            allow-credentials: true # ✅ Penting untuk cookies
```

### 3. Security Configuration

```java
// Spring Security configuration
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/catalog/api/v1/products").permitAll()
                .requestMatchers("/catalog/api/v1/brands").permitAll()
                .requestMatchers("/catalog/api/v1/categories").permitAll()
                // Protected endpoints
                .requestMatchers("/iam/api/v1/**").authenticated()
                .requestMatchers("/catalog/api/v1/**").authenticated()
            )
            .build();
    }
}
```

## Benefits

### 1. Correct API Design

- Public endpoints benar-benar public
- Protected endpoints memerlukan autentikasi
- Kontrak OpenAPI mencerminkan implementasi yang benar

### 2. Security Best Practices

- HttpOnly cookies mencegah XSS attacks
- CSRF protection dengan SameSite cookies
- Proper authentication flow

### 3. Developer Experience

- Clear separation antara public dan protected endpoints
- Consistent authentication mechanism
- Easy testing dengan Postman

## Migration Checklist

- [x] Remove security requirements from public endpoints
- [x] Update security scheme to use cookies
- [x] Regenerate OpenAPI types
- [x] Update frontend HTTP client configuration
- [ ] Update backend security configuration
- [ ] Test all public endpoints without authentication
- [ ] Test all protected endpoints with authentication
- [ ] Update API documentation

## Troubleshooting

### Common Issues

1. **401 Unauthorized on Public Endpoints**
   - Check apakah endpoint memiliki security requirement yang tidak perlu
   - Pastikan backend tidak memerlukan autentikasi untuk public endpoints

2. **Cookies Not Sent**
   - Pastikan `withCredentials: true` di HTTP client
   - Check CORS configuration untuk `allow-credentials: true`

3. **CORS Errors**
   - Pastikan gateway mengizinkan credentials
   - Check origin configuration di CORS settings
