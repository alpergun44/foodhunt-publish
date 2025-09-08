
# FoodHunt Backend (Publish-ready MVP)

- Express + NeDB (dosya tabanlı, hafif)
- Admin endpoints (token ile korumalı)
- Görsel yükleme (disk), statik servis
- CSV import
- Event logging

## Kurulum
```bash
cd backend
npm install
cp .env.example .env   # düzenle
npm run dev
```
`http://localhost:5050/api/health` kontrol et.

## .env
```
PORT=5050
ADMIN_TOKEN=supersecret
```

## Endpointler
- GET `/api/health`
- GET `/api/catalog?city=Istanbul&area=Kadikoy&limit=16`
- POST `/api/events` `{ event_type, session_id, payload }`
- (Admin, Bearer token)
  - GET `/api/admin/items?city=&area=&q=`
  - POST `/api/admin/items` (JSON body)
  - PUT `/api/admin/items/:id`
  - DELETE `/api/admin/items/:id`
  - POST `/api/admin/upload` (form-data `file`)
  - POST `/api/admin/import-csv` (body field `csv` = ham CSV metni)
