# 📋 Warehouse Backend - All API Endpoints

## 🔐 Authentication
```
POST /api/auth/register
POST /api/auth/login
```

## 🏥 Health Check
```
GET /health
GET /api/health
```

## 📦 Warehouse Management
```
GET /api/warehouse
GET /api/warehouse/inventory
GET /api/warehouse/packages
GET /api/warehouse/customers
GET /api/warehouse/manifests
GET /api/warehouse/messages
GET /api/warehouse/analytics
GET /api/warehouse/reports
GET /api/warehouse/settings
GET /api/warehouse/staff
GET /api/warehouse/account
```

## 👤 Customer Management
```
GET /api/customer
GET /api/customer/packages
GET /api/customer/shipping
GET /api/customer/shipping-addresses
GET /api/customer/profile
```

---

## 🧪 Quick Postman Test

### 1. Import this collection in Postman:
```
Base URL: http://localhost:5000
```

### 2. Test these endpoints in order:

#### Step 1: Health Check
```
GET http://localhost:5000/health
```

#### Step 2: Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
}
```

#### Step 3: Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "password123"
}
```

#### Step 4: Test Warehouse Endpoints
```
GET http://localhost:5000/api/warehouse
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Step 5: Test Customer Endpoints
```
GET http://localhost:5000/api/customer/packages
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📊 Total: 19 Endpoints

- **Auth**: 2 endpoints
- **Health**: 2 endpoints  
- **Warehouse**: 11 endpoints
- **Customer**: 5 endpoints

**All endpoints are ready for Postman testing! 🚀**
