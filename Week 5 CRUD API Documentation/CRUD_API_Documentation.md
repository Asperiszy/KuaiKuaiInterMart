# KuaiKuaiInterMart — Core Data CRUD API Documentation

## Base URL
```
http://127.0.0.1:8000/api
```

## Authentication
All protected endpoints require a JWT access token in the request header:
```
Authorization: Bearer <access_token>
```
Obtain a token via `POST /api/users/login/`.

---

## 1. Users

### Register
| | |
|---|---|
| **Endpoint** | `POST /api/users/register/` |
| **Auth** | None |

**Request Body:**
```json
{
  "username": "john",
  "email": "john@email.com",
  "password": "securepass123",
  "password2": "securepass123",
  "country": "US"
}
```
**Response `201`:**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@email.com",
  "country": "US"
}
```

---

### Login
| | |
|---|---|
| **Endpoint** | `POST /api/users/login/` |
| **Auth** | None |

**Request Body:**
```json
{
  "username": "john",
  "password": "securepass123"
}
```
**Response `200`:**
```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>"
}
```

---

### Get Profile
| | |
|---|---|
| **Endpoint** | `GET /api/users/profile/` |
| **Auth** | Required |

**Response `200`:**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@email.com",
  "role": "buyer",
  "phone": "+1234567890",
  "preferred_currency": "USD",
  "country": "US",
  "created_at": "2026-04-23T10:00:00Z"
}
```

---

### Update Profile
| | |
|---|---|
| **Endpoint** | `PATCH /api/users/profile/` |
| **Auth** | Required |

**Request Body (any fields to update):**
```json
{
  "phone": "+9876543210",
  "preferred_currency": "CNY"
}
```
**Response `200`:** Updated user object.

---

### Logout
| | |
|---|---|
| **Endpoint** | `POST /api/users/logout/` |
| **Auth** | Required |

**Request Body:**
```json
{
  "refresh": "<refresh_token>"
}
```
**Response `200`:**
```json
{
  "message": "Logged out successfully."
}
```

---

## 2. Products

### List Products
| | |
|---|---|
| **Endpoint** | `GET /api/products/` |
| **Auth** | None |

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name or description |
| `category` | int | Filter by category ID |
| `origin_country` | string | Filter by country code |
| `ordering` | string | `base_price_usd`, `created_at` |
| `page` | int | Page number (20 per page) |

**Response `200`:**
```json
{
  "count": 100,
  "next": "http://127.0.0.1:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "base_price_usd": "49.99",
      "category": "Electronics",
      "origin_country": "CN"
    }
  ]
}
```

---

### Get Product Detail
| | |
|---|---|
| **Endpoint** | `GET /api/products/{id}/` |
| **Auth** | None |

**Response `200`:** Full product object including regional prices and reviews.

---

### Create Product *(Admin only)*
| | |
|---|---|
| **Endpoint** | `POST /api/products/` |
| **Auth** | Admin required |

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "Noise cancelling headphones",
  "base_price_usd": "49.99",
  "category": 1,
  "origin_country": "CN"
}
```
**Response `201`:** Created product object.

---

### Update Product *(Admin only)*
| | |
|---|---|
| **Endpoint** | `PUT /api/products/{id}/` |
| **Auth** | Admin required |

**Request Body:** Full product object.

---

### Partial Update Product *(Admin only)*
| | |
|---|---|
| **Endpoint** | `PATCH /api/products/{id}/` |
| **Auth** | Admin required |

**Request Body (any fields to update):**
```json
{
  "base_price_usd": "39.99"
}
```

---

### Delete Product *(Admin only)*
| | |
|---|---|
| **Endpoint** | `DELETE /api/products/{id}/` |
| **Auth** | Admin required |

**Response `204`:** No content.

---

### List Categories
| | |
|---|---|
| **Endpoint** | `GET /api/products/categories/` |
| **Auth** | None |

**Response `200`:**
```json
[
  { "id": 1, "name": "Electronics" },
  { "id": 2, "name": "Clothing" }
]
```

---

### List Product Reviews
| | |
|---|---|
| **Endpoint** | `GET /api/products/{product_pk}/reviews/` |
| **Auth** | None |

---

### Create Product Review
| | |
|---|---|
| **Endpoint** | `POST /api/products/{product_pk}/reviews/` |
| **Auth** | Required |

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```
**Response `201`:** Created review object.

---

## 3. Orders

### List Orders
| | |
|---|---|
| **Endpoint** | `GET /api/orders/` |
| **Auth** | Required |

**Response `200`:** List of the authenticated user's orders.

---

### Get Order Detail
| | |
|---|---|
| **Endpoint** | `GET /api/orders/{id}/` |
| **Auth** | Required |

**Response `200`:** Full order object including items.

---

### Create Order
| | |
|---|---|
| **Endpoint** | `POST /api/orders/` |
| **Auth** | Required |

**Request Body:**
```json
{
  "items": [
    { "product": 1, "quantity": 2 },
    { "product": 3, "quantity": 1 }
  ]
}
```
**Response `201`:** Created order object.

---

### Update Order
| | |
|---|---|
| **Endpoint** | `PUT /api/orders/{id}/` |
| **Auth** | Required |

---

### Delete Order
| | |
|---|---|
| **Endpoint** | `DELETE /api/orders/{id}/` |
| **Auth** | Required |

**Response `204`:** No content.

---

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad request — validation error |
| `401` | Unauthorized — token missing or invalid |
| `403` | Forbidden — insufficient permissions |
| `404` | Not found |
| `500` | Server error |

**Example `400` error:**
```json
{
  "password": ["Passwords do not match."]
}
```

**Example `401` error:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```
