# KCD Logistics Integration - Complete Implementation

## 📋 User Roles & Authentication (As per Image)

| User Role | Authentication Method | Access Level |
|------------|-------------------|--------------|
| **Admin** | JWT Bearer Token | Full system access |
| **Warehouse Staff** | JWT Bearer Token | Warehouse operations |
| **Customers** | JWT Bearer Token | Own data access |
| **KCD Logistics** | X-API-Key Header | Specific operations |

## 🔐 KCD Authentication Flow

1. **Admin generates API key** via Swagger:
   ```
   POST /api/admin/api-keys/kcd
   Headers: Authorization: Bearer <admin_jwt_token>
   Body: { 
     "name": "KCD Logistics Webhook",
     "permissions": ["kcd_webhook", "webhook", "all"],
     "description": "API key for KCD Logistics packing system",
     "warehouseId": "507f1f77bcf86cd799439011"
   }
   ```

2. **Response returns key** (shown only once):
   ```json
   {
     "success": true,
     "data": {
       "key": "kcd_alb2c3d4e5f67890abcdef...",
       "name": "KCD Logistics Webhook",
       "permissions": ["kcd_webhook", "webhook", "all"],
       "description": "API key for KCD Logistics packing system",
       "warehouseId": "507f1f77bcf86cd799439011",
       "isActive": true,
       "createdAt": "2024-01-15T10:30:00Z"
     }
   }
   ```

3. **KCD sends requests** with header:
   ```
   X-API-Key: kcd_alb2c3d4e5f67890abcdef...
   ```

## 🚀 KCD Accessible Endpoints

### ✅ **Generate API Key for KCD** (NEW - Added to Admin Routes)
```
POST /api/admin/api-keys/kcd
Headers: Authorization: Bearer <admin_jwt_token>
Body: {
  "name": "KCD Logistics Webhook",
  "permissions": ["kcd_webhook", "webhook", "all"],
  "description": "API key for KCD Logistics packing system",
  "warehouseId": "507f1f77bcf86cd799439011"
}
```
- **Purpose**: Generate permanent API key for KCD Logistics
- **Authentication**: JWT Bearer token (admin only)
- **Response**: API key shown only once

### ✅ **Get Customer List**
```
GET /api/warehouse/customers
Headers: X-API-Key: kcd_abc123def456...
```
- **Purpose**: Retrieve customer list for shipping
- **Authentication**: X-API-Key header
- **Response**: Paginated customer data

### ✅ **Add Packages**
```
POST /api/warehouse/packages/add
Headers: X-API-Key: kcd_abc123def456...
Body: { package details }
```
- **Purpose**: Create new packages in system
- **Authentication**: X-API-Key header
- **Response**: Created package with tracking number

### ✅ **Update Packages**
```
PUT /api/warehouse/packages/:id
Headers: X-API-Key: kcd_abc123def456...
Body: { updated package fields }
```
- **Purpose**: Update existing package information
- **Authentication**: X-API-Key header
- **Response**: Updated package data

### ✅ **Delete Packages** (via Webhook)
```
POST /api/webhooks/kcd/package-deleted
Headers: X-API-Key: kcd_abc123def456...
Body: { trackingNumber, courierCode }
```
- **Purpose**: KCD notifies when package is deleted
- **Authentication**: X-API-Key header
- **Response**: Confirmation of deletion

### ✅ **Update Manifests**
```
PUT /api/warehouse/manifests/:id
Headers: X-API-Key: kcd_abc123def456...
Body: { manifest updates }
```
- **Purpose**: Update manifest information
- **Authentication**: X-API-Key header
- **Response**: Updated manifest data

## 🔧 **Combined Authentication System**

All warehouse endpoints use `combinedAuth` middleware which accepts:

1. **JWT Bearer Token** (for Admin/Warehouse Staff/Customers)
   ```
   Authorization: Bearer <jwt_token>
   ```

2. **X-API-Key Header** (for KCD Logistics)
   ```
   X-API-Key: kcd_abc123def456...
   ```

## 📚 **Swagger Documentation**

All endpoints are properly documented in Swagger with:
- **Dual Security**: Both `bearerAuth` and `ApiKeyAuth` options
- **Clear Descriptions**: Indicate KCD Logistics support
- **Complete Examples**: Request/response formats

## 🎯 **Implementation Status**

✅ **Completed Features:**
- API key generation (admin only) - **NEW in main admin routes**
- X-API-Key validation middleware
- Combined authentication (JWT + API Key)
- All required KCD endpoints
- Proper Swagger documentation
- Usage tracking and rate limiting
- Webhook endpoints for KCD notifications

✅ **Security Features:**
- API keys are `kcd_` prefixed
- Keys returned only once during generation
- Usage count tracking
- Expiration support
- Warehouse association
- Admin-only key management

## 🚀 **Ready for Production**

The system now exactly matches the requirements shown in the image:
- KCD Logistics uses X-API-Key authentication
- Has access to all specified operations
- Proper integration with existing user roles
- Complete audit trail and security
- **Admin API key generation** available in main admin section

**Flow**: Admin generates key → KCD copies key → KCD uses X-API-Key header → System validates → Access granted

### 📋 **Exact Implementation Match**

✅ **Image Requirements Met:**
- [x] Generate API Key for KCD endpoint in admin section
- [x] Proper request/response format as shown in image
- [x] X-API-Key authentication for KCD operations
- [x] All KCD operations accessible
- [x] Combined authentication system
- [x] Complete Swagger documentation
