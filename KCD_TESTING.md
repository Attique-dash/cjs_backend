# KCD API Testing Guide

This guide explains how to test the KCD Logistics integration endpoints.

## Prerequisites

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Ensure you have admin credentials:**
   - Default admin email: `admin@warehouse.com`
   - Default admin password: `admin123`
   - Or set environment variables: `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Testing Methods

### 1. Automated Test Script (Recommended)

Run the comprehensive test script:
```bash
npm run test:kcd
```

This script tests:
- ✅ Admin authentication
- ✅ KCD API key generation (with auto-resolved warehouseId)
- ✅ KCD connection info retrieval
- ✅ Warehouse endpoints with API key authentication
- ✅ Webhook endpoints
- ✅ API key management (list, activate, deactivate)

### 2. Manual Testing via Swagger UI

1. Open your browser and navigate to:
   ```
   http://localhost:5000/docs
   ```

2. **Test Admin Authentication:**
   - Go to "Authentication" → "POST /api/auth/login"
   - Use admin credentials to get a JWT token
   - Click "Authorize" and enter: `Bearer YOUR_JWT_TOKEN`

3. **Test KCD API Key Generation:**
   - Go to "Admin API Keys" → "POST /api/admin/api-keys/kcd"
   - Click "Try it out" then "Execute"
   - Copy the returned `key` value (shown only once!)
   - Note the `kcdPortalFields` with all endpoint URLs

4. **Test KCD Connection Info:**
   - Go to "Admin API Keys" → "GET /api/admin/api-keys/kcd-info"
   - Verify the endpoint URLs match what KCD needs

5. **Test Warehouse Endpoints with API Key:**
   - Click "Authorize" and enter your KCD API key in the "api_key" field
   - Test endpoints under "Warehouse" tag:
     - `GET /api/warehouse/customers`
     - `GET /api/warehouse/packages/search`
     - `POST /api/warehouse/packages/add`
     - `PUT /api/warehouse/packages/{id}`

### 3. Manual Testing with curl

#### Generate KCD API Key:
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@warehouse.com","password":"admin123"}'

# Use the token to generate KCD API key
curl -X POST http://localhost:5000/api/admin/api-keys/kcd \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Warehouse Endpoints with API Key:
```bash
# Test customers endpoint
curl -X GET http://localhost:5000/api/warehouse/customers \
  -H "X-API-Key: YOUR_KCD_API_KEY"

# Test add package
curl -X POST http://localhost:5000/api/warehouse/packages/add \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KCD_API_KEY" \
  -d '{
    "trackingNumber": "TEST123456",
    "userCode": "TEST-001",
    "weight": 2.5,
    "serviceMode": "air",
    "shipper": "Test Shipper",
    "description": "Test package"
  }'
```

#### Test Webhook Endpoints:
```bash
# Test package-created webhook
curl -X POST http://localhost:5000/api/webhooks/kcd/package-created \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KCD_API_KEY" \
  -d '{
    "trackingNumber": "WEBHOOK123",
    "userCode": "TEST-001",
    "weight": 1.5,
    "serviceMode": "air",
    "status": "received"
  }'
```

## Expected KCD Portal Configuration

After generating a KCD API key, you should get these URLs for the KCD portal:

- **API Access Token:** `kcd_abcdef123456...` (copy this value)
- **Get Customers:** `http://localhost:5000/api/warehouse/customers`
- **Add Package:** `http://localhost:5000/api/warehouse/packages/add`
- **Update Package:** `http://localhost:5000/api/warehouse/packages/:id`
- **Delete Package:** `http://localhost:5000/api/webhooks/kcd/package-deleted`
- **Update Manifest:** `http://localhost:5000/api/webhooks/kcd/manifest-created`

## Key Features Tested

1. **Auto-Resolved WarehouseId:** API key generation works without providing warehouseId
2. **Combined Authentication:** Warehouse endpoints accept both JWT and API key
3. **Webhook Authentication:** Webhook endpoints only accept API key
4. **Proper Endpoint Mapping:** Update Package uses `:id` parameter as expected by KCD
5. **API Key Management:** Full CRUD operations for API keys
6. **Swagger Documentation:** All endpoints properly documented

## Troubleshooting

### Common Issues:

1. **"No active warehouse found"**
   - Solution: Create a warehouse first using the admin interface or seed script

2. **"Invalid or inactive API key"**
   - Solution: Generate a new API key or activate an existing one

3. **CORS errors**
   - Solution: Ensure your KCD domain is in `CORS_ORIGIN` environment variable

4. **Authentication failures**
   - Solution: Check that you're using the correct auth method (JWT for admin, API key for KCD)

### Environment Variables:

```bash
# Server configuration
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# CORS (add KCD domain here)
CORS_ORIGIN=http://localhost:3000,https://pack.kcdlogistics.com

# Admin credentials (optional, defaults shown)
ADMIN_EMAIL=admin@warehouse.com
ADMIN_PASSWORD=admin123
```

## Success Indicators

✅ All tests pass in the automated script  
✅ Swagger UI shows all endpoints with proper documentation  
✅ API key generation returns KCD portal fields  
✅ Warehouse endpoints work with API key authentication  
✅ Webhook endpoints accept KCD requests  
✅ Update Package endpoint uses `:id` parameter correctly  

When all these work, your KCD integration is ready for production!
