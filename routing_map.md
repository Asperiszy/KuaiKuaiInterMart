# GlobalMart — Page Routing Mapping Table

## Frontend Routes (React Router)

| Route | Page Component | Auth Required | Description |
|-------|---------------|---------------|-------------|
| / | Home.jsx | No | Landing page |
| /products | ProductList.jsx | No | Browse all products |
| /products/:id | ProductDetail.jsx | No | Product detail + regional prices |
| /login | Login.jsx | No | User login |
| /register | Register.jsx | No | New user registration |
| /dashboard | Dashboard.jsx | Yes | User dashboard |
| /cart | Cart.jsx | Yes | Cart + checkout + payment |
| /orders | OrderHistory.jsx | Yes | Order history + tracking |

## Backend API Routes (Django)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/token/ | No | Login, returns JWT token |
| POST | /api/auth/token/refresh/ | No | Refresh access token |
| POST | /api/users/register/ | No | Register new user |
| GET | /api/users/me/ | Yes | View or update profile |
| GET | /api/products/ | No | List all products |
| GET | /api/products/:id/ | No | Product detail |
| GET | /api/products/categories/ | No | List categories |
| POST | /api/orders/ | Yes | Create order |
| GET | /api/orders/:id/ | Yes | Single order detail |
| POST | /api/payments/simulate/:id/ | Yes | Simulate payment |
| GET | /api/logistics/:id/ | Yes | Shipment tracking |
