# Tech Stack List — KuaiKuaiInterMart

## Frontend

| Technology | Version | Purpose | Why I Chose It |
|-----------|---------|---------|----------------|
| React | 18.x | UI framework (SPA) | Component-based, supports dynamic cart/currency updates without page reloads |
| React Router DOM | 6.x | Client-side routing | Standard routing library for React SPAs |
| Axios | 1.x | HTTP client | Simple REST requests to backend; supports JWT token injection via interceptors |
| Vite | 5.x | Build tool / dev server | Faster than CRA, lightweight, minimal config |

## Backend

| Technology | Version | Purpose | Why I Chose It |
|-----------|---------|---------|----------------|
| Python | 3.11+ | Backend language | Strong ecosystem; Django is Python-native |
| Django | 5.x | Web framework | Built-in ORM, admin panel, auth — reduces setup time significantly |
| Django REST Framework | 3.15.x | REST API layer | Serializers, viewsets, authentication — purpose-built for RESTful APIs |
| djangorestframework-simplejwt | 5.x | JWT authentication | Stateless token-based auth; standard for decoupled frontend/backend |
| django-cors-headers | 4.x | CORS handling | Allows React (port 3000) to call Django (port 8000) in development |

## Database

| Technology | Version | Purpose | Why I Chose It |
|-----------|---------|---------|----------------|
| MySQL | 8.0 | Relational database | Foreign key enforcement; relational model fits e-commerce entities |
| mysqlclient | 2.x | Django–MySQL connector | Official recommended connector for Django + MySQL |

## Dev Tools

| Tool | Purpose |
|------|---------|
| GitHub | Version control and repository hosting |
| Postman | API testing and documentation |
| MySQL Workbench | ER diagram design and DB management |
| Draw.io | Architecture diagrams |
| VS Code | Code editor |

## Rationale Summary

Technologies were selected to: (1) reduce setup overhead — Django's built-in tools cover auth, admin, and ORM with no extra libraries; (2) support testability at every layer; (3) follow industry-standard patterns relevant beyond this course; (4) fit a solo developer's schedule without microservices complexity.
