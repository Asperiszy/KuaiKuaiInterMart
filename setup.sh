#!/bin/bash
# GlobalMart Full-Stack Setup Script
# Run this from the root of the KuaiKuaiInterMart repo

set -e

echo "🌏 Setting up GlobalMart..."

# ── Backend ───────────────────────────────────────────────────────────────────
echo ""
echo "📦 Setting up Django backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env — edit SECRET_KEY before deploying!"
fi

# Run migrations
python manage.py makemigrations users products orders logistics payments
python manage.py migrate

# Create superuser (optional, skip with Ctrl+C)
echo ""
echo "👤 Create a Django superuser (for /admin panel):"
python manage.py createsuperuser --noinput \
  --username admin \
  --email admin@globalmart.com 2>/dev/null || true

echo "✅ Backend ready!"
deactivate
cd ..

# ── Frontend ──────────────────────────────────────────────────────────────────
echo ""
echo "⚛️  Setting up React frontend..."
cd frontend
npm install
echo "✅ Frontend ready!"
cd ..

echo ""
echo "🎉 Setup complete! To start the project:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    source venv/bin/activate"
echo "    python manage.py runserver"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open http://localhost:5173"
echo "  Django admin: http://localhost:8000/admin"
echo "  API root:     http://localhost:8000/api/"
