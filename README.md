# FoodHunt — Launch-Ready MVP

**"Ne yesem?" sorusunu 60 saniyede bracket turnuvasıyla çöz.**

## Quick Start

### Backend
```bash
cd backend
npm install
node server.js
# → http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Admin Panel
- URL: `http://localhost:5173/admin`
- Şifre: `.env` dosyasındaki `ADMIN_PASSWORD` (varsayılan: `foodhunt2026`)

## CSV Import Formatı
Admin panelinden `Şablon İndir` butonu ile örnek CSV indir.

Zorunlu sütun: `name`
Opsiyonel: `cuisine, area, price_level, rating, calories_min, calories_max, yemeksepeti_link, getir_link, trendyol_link, image_url, description`

## GA4 Kurulumu
`frontend/index.html` içindeki `GA_MEASUREMENT_ID` değerini kendi GA4 ölçüm ID'nle değiştir.

## Deploy
- **Frontend:** Vercel (root: `frontend/`, build: `npm run build`, output: `dist/`)
- **Backend:** Railway / Render / Fly.io
- **Env:** `ADMIN_PASSWORD`, `PORT`, `ALLOWED_ORIGINS` set et

## Özellikler (v2.0)
- ✅ Bracket turnuvası (8 veya 16 restoran)
- ✅ Filtre: bölge + mutfak
- ✅ Deeplink: Yemeksepeti / Getir / Trendyol
- ✅ Sonucu paylaş (WhatsApp, Twitter, kopyala)
- ✅ Food Radio (mini player)
- ✅ İlham kartları
- ✅ GA4 + backend analytics
- ✅ Admin panel: CRUD + CSV import + fotoğraf yükleme
- ✅ KVKK / Kullanım Şartları / Çerez sayfaları
- ✅ Mobile-first responsive
- ✅ Dark theme
