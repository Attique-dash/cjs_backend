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
   Body: { "warehouseId": "507f1f77bcf86cd799439011" }
   ```

2. **Response returns key** (shown only once):
   ```json
   {
     "success": true,
     "data": {
       "key": "kcd_abc123def456...",
       "nextSteps": {
         "step1": "Copy the 'key' value above",
         "step2": "Go to https://pack.kcdlogistics.com → Couriers → Edit → Courier System API tab",
         "step3": "Paste the key into the 'API Access Token' field"
       }
     }
   }
   ```

3. **KCD sends requests** with header:
   ```
   X-API-Key: kcd_abc123def456...
   ```

## 🚀 KCD Accessible Endpoints

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
- API key generation (admin only)
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

**Flow**: Admin generates key → KCD copies key → KCD uses X-API-Key header → System validates → Access granted
