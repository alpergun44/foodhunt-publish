/**
 * FoodHunt — Excel'den Restoran Import Script
 *
 * Kullanım:
 *   node import-excel.js <excel_dosyası.xlsx>
 *
 * Excel'deki "Restoranlar" sheet'inden veri okur,
 * MongoDB'ye ekler (zaten var olanları atlar).
 */

const XLSX = require('xlsx');
const path = require('path');

// MongoDB bağlantısı
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://adnanalpergun_db_user:GRpSVDu8DqCqqqya@cluster0.amdecfo.mongodb.net/foodhunt?appName=Cluster0';

async function importFromExcel(filePath) {
  const { MongoClient } = require('mongodb');

  // 1. Excel'i oku
  console.log(`📂 Excel dosyası okunuyor: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Restoranlar'];
  if (!sheet) {
    console.error('❌ "Restoranlar" sheet bulunamadı!');
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(sheet);
  console.log(`📊 ${rows.length} satır bulundu`);

  // 2. MongoDB'ye bağlan
  console.log('🔌 MongoDB\'ye bağlanılıyor...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('foodhunt');
  const collection = db.collection('restaurants');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const name = (row['Restoran Adı'] || '').trim();
    const area = (row['İlçe'] || '').trim();

    if (!name || !area) {
      skipped++;
      continue;
    }

    // Zaten var mı kontrol et
    const existing = await collection.findOne({ name, area });
    if (existing) {
      console.log(`  ⏭️  ${name} (${area}) — zaten var`);
      skipped++;
      continue;
    }

    try {
      const doc = {
        id: Date.now() + imported,
        name,
        cuisine: (row['Mutfak Türü'] || '').trim(),
        area,
        rating: parseFloat(row['Puan']) || 0,
        price_level: parseInt(row['Fiyat Seviyesi (1-4)']) || 2,
        description: (row['Açıklama'] || '').trim(),
        yemeksepeti_link: (row['Yemeksepeti Link'] || '').trim(),
        getir_link: (row['Getir Link'] || '').trim(),
        trendyol_link: (row['Trendyol Link'] || '').trim(),
        google_maps_url: (row['Google Maps Link'] || '').trim(),
        website: (row['Website'] || '').trim(),
        image_url: '',
        tags: (row['Etiketler (virgülle)'] || '').split(',').map(t => t.trim()).filter(Boolean),
        top3_products: [
          row['Top 1 Ürün'] ? { name: row['Top 1 Ürün'].trim(), emoji: row['Top 1 Emoji'] || '🍽️' } : null,
          row['Top 2 Ürün'] ? { name: row['Top 2 Ürün'].trim(), emoji: row['Top 2 Emoji'] || '🍽️' } : null,
          row['Top 3 Ürün'] ? { name: row['Top 3 Ürün'].trim(), emoji: row['Top 3 Emoji'] || '🍽️' } : null,
        ].filter(Boolean),
        platform_ratings: {
          yemeksepeti: parseFloat(row['Yemeksepeti Puan']) || null,
          getir: parseFloat(row['Getir Puan']) || null,
          trendyol: parseFloat(row['Trendyol Puan']) || null,
        },
        operating_hours: {
          open: (row['Açılış Saati'] || '').trim(),
          close: (row['Kapanış Saati'] || '').trim(),
        },
        is_active: 1,
        source: (row['Kaynak'] || 'excel_import').trim(),
        created_at: new Date().toISOString(),
      };

      await collection.insertOne(doc);
      console.log(`  ✅ ${name} (${area}) — eklendi`);
      imported++;
    } catch (err) {
      console.error(`  ❌ ${name}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════');
  console.log(`✅ Eklenen: ${imported}`);
  console.log(`⏭️  Atlanan: ${skipped}`);
  console.log(`❌ Hata: ${errors}`);
  console.log('═══════════════════════════════');

  await client.close();
}

// Çalıştır
const file = process.argv[2];
if (!file) {
  console.log('Kullanım: node import-excel.js <dosya.xlsx>');
  process.exit(1);
}

importFromExcel(path.resolve(file))
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
