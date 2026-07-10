/**
 * FoodHunt — NeDB → MongoDB Migrasyon Scripti
 *
 * Lokal NeDB dosyalarındaki (backend/db/*.db) tüm veriyi MongoDB'ye taşır.
 * Idempotent: tekrar çalıştırılırsa kayıtları günceller, çoğaltmaz (_id upsert).
 *
 * Kullanım:
 *   1. MongoDB Atlas'ta (veya başka bir Mongo'da) database oluştur
 *   2. backend/.env dosyasına ekle:
 *        MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/foodhunt
 *        DB_TYPE=mongo        <-- migrasyondan SONRA ekle
 *   3. Çalıştır:  node scripts/migrate-nedb-to-mongo.js
 *   4. Doğrulama çıktısını kontrol et, sonra DB_TYPE=mongo ile server'ı başlat
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const Datastore = require('nedb-promises');
const { MongoClient } = require('mongodb');

const COLLECTIONS = [
  'restaurants', 'events', 'cards', 'users', 'favorites',
  'history', 'districts', 'tournaments', 'regions', 'points',
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('HATA: MONGO_URI tanımlı değil. backend/.env dosyasına MONGO_URI ekle.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const mdb = client.db();
  console.log(`MongoDB bağlantısı OK → ${uri.replace(/\/\/.*@/, '//***@')}\n`);

  const DB_DIR = path.join(__dirname, '..', 'db');
  let total = 0;

  for (const name of COLLECTIONS) {
    const store = Datastore.create({ filename: path.join(DB_DIR, `${name}.db`), autoload: true });
    const docs = await store.find({});
    if (!docs.length) { console.log(`- ${name}: boş, atlandı`); continue; }

    const ops = docs.map(d => ({
      replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true },
    }));
    await mdb.collection(name).bulkWrite(ops, { ordered: false });
    total += docs.length;
    console.log(`✓ ${name}: ${docs.length} kayıt aktarıldı`);
  }

  // ── Doğrulama ──
  console.log('\n── Doğrulama ──');
  for (const name of COLLECTIONS) {
    const count = await mdb.collection(name).countDocuments();
    if (count > 0) console.log(`  ${name}: ${count} kayıt Mongo'da`);
  }
  console.log(`\nToplam ${total} kayıt taşındı.`);
  console.log('Sıradaki adım: backend/.env içine DB_TYPE=mongo ekle ve server\'ı yeniden başlat.');

  await client.close();
}

main().catch(e => { console.error('Migrasyon hatası:', e); process.exit(1); });
