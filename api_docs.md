# API Documentation — KuaiKuaiInterMart
**Base URL:** `http://localhost:8000/api/`
**Auth:** JWT Bearer token — include `Authorization: Bearer <token>` header on protected routes
**Format:** All requests and responses in JSON

---

## 1. POST `/api/auth/register/`
Register a new user account.

**Auth required:** No

**Request body:**
```json
{
  "username": "asia123",
  "email": "asia@example.com",
  "password": "securepassword",
  "first_name": "Asia",
  "last_name": "Zhang"
}
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "username": "asia123",
  "email": "asia@example.com",
  "message": "Account created successfully."
}
```

**Error `400 Bad Request`:** Email or username already exists / validation failure.

---

## 2. POST `/api/auth/login/`
Authenticate and receive JWT tokens.

**Auth required:** No

**Request body:**
```json
{
  "username": "asia123",
  "password": "securepassword"
}
```

**Response `200 OK`:**
```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>"
}
```

**Error `401 Unauthorized`:** Invalid credentials.

---

## 3. GET `/api/products/`
List all products. Supports filtering and currency conversion.

**Auth required:** No

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category name |
| `currency` | string | Display prices in this currency code (e.g. `CNY`) |
| `region` | string | Filter by product origin region |
| `search` | string | Search by product name |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Wireless Earbuds",
    "description": "Noise-cancelling Bluetooth earbuds.",
    "base_price": "29.99",
    "converted_price": "217.19",
    "currency": "CNY",
    "category": "Electronics",
    "region": "China",
    "stock": 150,
    "image_url": "https://..."
  }
]
```

---

## 4. GET `/api/products/{id}/`
Retrieve a single product by ID.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "id": 1,
  "name": "Wireless Earbuds",
  "description": "Noise-cancelling Bluetooth earbuds.",
  "base_price": "29.99",
  "currency": "USD",
  "category": "Electronics",
  "region": "China",
  "stock": 150,
  "image_url": "https://..."
}
```

**Error `404 Not Found`:** Product does not exist.

---

## 5. GET `/api/cart/`
Retrieve the current user's cart.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "id": 3,
  "items": [
    {
      "id": 7,
      "product_id": 1,
      "product_name": "Wireless Earbuds",
      "unit_price": "29.99",
      "quantity": 2,
      "subtotal": "59.98"
    }
  ],
  "total": "59.98",
  "currency": "USD"
}
```

---

## 6. POST `/api/cart/items/`
Add a product to the cart or update its quantity.

**Auth required:** Yes

**Request body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response `200 OK`:**
```json
{
  "message": "Cart updated.",
  "product_id": 1,
  "quantity": 2
}
```

**Error `400 Bad Request`:** Insufficient stock / invalid product ID.

---

## 7. POST `/api/orders/`
Place an order from the current cart contents.

**Auth required:** Yes

**Request body:**
```json
{
  "shipping_address": "123 Main Street, Shanghai, China",
  "currency": "CNY"
}
```

**Response `201 Created`:**
```json
{
  "id": 12,
  "status": "pending",
  "total_amount": "434.38",
  "currency": "CNY",
  "items": [
    {
      "product_id": 1,
      "product_name": "Wireless Earbuds",
      "quantity": 2,
      "unit_price": "217.19"
    }
  ],
  "created_at": "2026-04-23T18:00:00Z"
}
```

**Error `400 Bad Request`:** Empty cart / stock issue.

---

## 8. GET `/api/orders/{id}/`
Retrieve a specific order including logistics status.

**Auth required:** Yes (owner only)

**Response `200 OK`:**
```json
{
  "id": 12,
  "status": "shipped",
  "total_amount": "434.38",
  "currency": "CNY",
  "shipping_address": "123 Main Street, Shanghai, China",
  "payment": {
    "status": "completed",
    "method": "simulated"
  },
  "logistics": {
    "tracking_number": "KK-20260423-001",
    "carrier": "SF Express",
    "status": "in_transit",
    "estimated_delivery": "2026-04-28"
  },
  "created_at": "2026-04-23T18:00:00Z"
}
```

**Error `403 Forbidden`:** Attempting to access another user's order.
**Error `404 Not Found`:** Order does not exist.

---

## Error Format

All errors follow this structure:
```json
{
  "error": "Short error message.",
  "detail": "More specific explanation if needed."
}
```

## Standard HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET / update |
| 201 | Created — successful POST |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — authenticated but not allowed |
| 404 | Not Found — resource does not exist |
