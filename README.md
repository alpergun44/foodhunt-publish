
# FoodHunt (Publish-ready MVP)

Bu paket yayınlanabilir bir Aşama 1 sürümüdür:
- Frontend: React + Tailwind, şık UI
- Admin panel: CRUD + görsel yükleme + CSV import
- Backend: Express + NeDB dosya DB + görüntü yükleme (disk)

## Yerel Çalıştırma
### Backend
```
cd backend
npm install
cp .env.example .env
# .env içindeki ADMIN_TOKEN değerini değiştirin
npm run dev
```
- Sağlık: `http://localhost:5050/api/health`

### Frontend
```
cd frontend
npm install
echo "VITE_API_BASE=http://localhost:5050" > .env
npm run dev
```
- Uygulama: `http://localhost:5173`
- Admin: `http://localhost:5173/admin` (token: .env'deki ADMIN_TOKEN)

## Üretime Altyapı (öneri)
- **Backend:** Render / Railway (Node server). Kalıcı disk veya external storage kullanın.
- **Frontend:** Vercel / Netlify (static build). ENV: `VITE_API_BASE` = backend URL.
- **Görseller:** Varsayılan disk yükleme. Üretimde Cloud storage (S3/Cloudinary) entegre etmek için upload endpointini uyarlayın.

## CSV Şablon Alanları
`name,archetype,cuisine,price_band,satiety,spicy,diet_tags,temp,kcal_range,macros_hint,image_url,city,area`
