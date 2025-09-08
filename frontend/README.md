
# FoodHunt Frontend (Publish-ready)

- Vite + React + Tailwind
- /admin panel (CRUD, görsel upload, CSV import)
- / (kamuya açık oyun akışı)

## Kurulum
```bash
cd frontend
npm install
echo "VITE_API_BASE=http://localhost:5050" > .env
npm run dev
```
Üretimde build:
```bash
npm run build
npm run preview
```
