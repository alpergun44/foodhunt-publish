#!/bin/bash
# FoodHunt — Tek komutla backend + frontend baslat
# Kullanim: ./start-v2.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "  FoodHunt — Baslatiliyor..."
echo "========================================="

# Backend bagimliliklari
echo "[1/4] Backend bagimliliklari kontrol ediliyor..."
cd backend
if [ ! -d "node_modules" ]; then
  echo "  npm install calistiriliyor..."
  npm install
fi
cd ..

# Frontend bagimliliklari
echo "[2/4] Frontend bagimliliklari kontrol ediliyor..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "  npm install calistiriliyor..."
  npm install
fi
cd ..

# Seed data
echo "[3/4] Restoran verisi kontrol ediliyor..."
cd backend
node -e "
  const Datastore = require('nedb-promises');
  const path = require('path');
  const db = Datastore.create({ filename: path.join(__dirname, 'db', 'restaurants.db'), autoload: true });
  db.count({}).then(c => {
    if (c < 100) {
      console.log('  Restoran verisi az (' + c + '), seed calistiriliyor...');
      process.exit(1);
    } else {
      console.log('  ' + c + ' restoran mevcut');
      process.exit(0);
    }
  });
" 2>/dev/null || node seed.v2.js 2>/dev/null || node seed.js 2>/dev/null || true
cd ..

# Backend ve Frontend'i arka planda baslat
echo "[4/4] Sunucular baslatiliyor..."
echo ""

cd backend
node server.js &
BACKEND_PID=$!
cd ..

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2
echo ""
echo "========================================="
echo "  FoodHunt calisiyor!"
echo ""
echo "  Uygulama:    http://localhost:5173"
echo "  API:         http://localhost:3001"
echo "  API Docs:    http://localhost:3001/api/docs"
echo "  Admin Panel: http://localhost:5173/admin"
echo ""
echo "  Durdurmak icin: Ctrl+C"
echo "========================================="

cleanup() {
  echo ""
  echo "Sunucular kapatiliyor..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID 2>/dev/null
  wait $FRONTEND_PID 2>/dev/null
  echo "Gule gule!"
  exit 0
}

trap cleanup SIGINT SIGTERM
wait
