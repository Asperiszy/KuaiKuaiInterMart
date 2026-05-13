# 🌏 GlobalMart (KuaiKuaiInterMart)

Cross-border e-commerce simulation platform built with **Django REST Framework** + **React (Vite)**.

---

## Project Structure

```
KuaiKuaiInterMart/
├── backend/                   # Django backend
│   ├── config/                # Settings, URLs, WSGI
│   ├── apps/
│   │   ├── users/             # Custom user model + JWT auth
│   │   ├── products/          # Products, categories, regional prices, reviews
│   │   ├── orders/            # Order creation + management
│   │   ├── payments/          # Simulated payment processing
│   │   └── logistics/         # Shipment tracking
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── services/api.js    # ALL axios calls to Django (the bridge)
│   │   ├── context/           # AuthContext (global login state)
│   │   ├── pages/             # Home, ProductList, ProductDetail,
│   │   │                      # Login, Register, Dashboard, Cart, OrderHistory
│   │   └── components/        # Navbar
│   ├── vite.config.js         # Proxy: /api/* → Django :8000
│   └── package.json
│
└── setup.sh                   # One-command setup script
```

---

## Quick Start

### Option A — Automated (recommended)
```bash
chmod +x setup.sh
./setup.sh
```

### Option B — Manual

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations users products orders logistics payments
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver        # → http://localhost:8000
```

**Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev                       # → http://localhost:5173
```

---

## How Frontend ↔ Backend Communication Works

```
React (Vite :5173)
       │
       │  fetch('/api/products/')
       ▼
Vite Dev Proxy (vite.config.js)
       │
       │  forwards to http://localhost:8000/api/products/
       ▼
Django REST Framework (:8000)
       │
       │  queries
       ▼
  SQLite / PostgreSQL (db.sqlite3)
```

The key file is `frontend/src/services/api.js` — every API call goes through there. 
Auth tokens are injected automatically by Axios interceptors.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/token/` | ❌ | Login → returns JWT tokens |
| POST | `/api/auth/token/refresh/` | ❌ | Refresh access token |
| POST | `/api/users/register/` | ❌ | Register new user |
| GET/PATCH | `/api/users/me/` | ✅ | View/update profile |
| GET | `/api/products/` | ❌ | List products (search, filter, paginate) |
| GET | `/api/products/:id/` | ❌ | Product detail + regional prices + reviews |
| GET | `/api/products/categories/` | ❌ | List categories |
| GET/POST | `/api/products/:id/reviews/` | ❌/✅ | Read/write reviews |
| GET/POST | `/api/orders/` | ✅ | List orders / create order |
| GET | `/api/orders/:id/` | ✅ | Order detail |
| POST | `/api/payments/simulate/:orderId/` | ✅ | Simulate payment |
| GET | `/api/logistics/:orderId/` | ✅ | Tracking info |

Admin panel: `http://localhost:8000/admin`

---

## Database

**Development:** SQLite (zero config — `db.sqlite3` created automatically)

**Switch to PostgreSQL** (for production / team sharing):
1. Install PostgreSQL and create a database named `globalmart`
2. In `backend/.env`, set `DB_NAME`, `DB_USER`, `DB_PASSWORD`
3. In `backend/config/settings.py`, uncomment the PostgreSQL `DATABASES` block and comment out the SQLite one
4. Run `python manage.py migrate`

---

## Key GlobalMart Features Implemented

| Feature | Where |
|---------|-------|
| Multi-currency regional prices | `apps/products/models.py` → `RegionalPrice` |
| Price comparison table | `frontend/src/pages/ProductDetail.jsx` |
| Payment simulation (4 methods) | `apps/payments/views.py` + Cart page |
| Logistics tracking | `apps/logistics/models.py` + OrderHistory page |
| JWT authentication | `config/settings.py` + `AuthContext.jsx` |
| Auto token refresh | `frontend/src/services/api.js` interceptors |
| Django Admin panel | All apps registered in `admin.py` |

---

## Team Notes

- **Asia:** Focus on `frontend/src/pages/` and `apps/products/` for your deliverables
- **Tilde:** Push the `backend/` folder to GitHub, set up the repo structure
- Tilde should run `makemigrations` after any model changes and commit the migration files
- Never commit `backend/.env` — it's in `.gitignore`

---

## .gitignore additions needed

```
# Backend
backend/venv/
backend/.env
backend/db.sqlite3
backend/media/
backend/__pycache__/
backend/**/__pycache__/
backend/**/*.pyc

# Frontend
frontend/node_modules/
frontend/dist/
```
