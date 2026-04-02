/**
 * One-time script: Updates ALL restaurants' image_url from seed data.
 * Run with: node backend/fix-photos.js
 *
 * Connects to MongoDB Atlas and force-updates image_url for every restaurant
 * that exists in the seed data.
 */
const { MongoClient } = require('mongodb');
const seedData = require('./seed.v2.data.json');
const { TUZLA_RESTAURANTS } = require('./seed-tuzla');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://adnanalpergun_db_user:GRpSVDu8DqCqqqya@cluster0.amdecfo.mongodb.net/foodhunt?appName=Cluster0';

async function fixPhotos() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('MongoDB bağlantısı başarılı');

    const db = client.db('foodhunt');
    const col = db.collection('restaurants');

    const allSeed = [...seedData, ...TUZLA_RESTAURANTS];
    console.log(`Seed'de ${allSeed.length} restoran var`);

    let updated = 0;
    let notFound = 0;
    let alreadyHas = 0;

    for (const r of allSeed) {
      if (!r.image_url) continue;

      const result = await col.updateOne(
        { name: r.name, area: r.area },
        { $set: { image_url: r.image_url } }
      );

      if (result.matchedCount === 0) {
        notFound++;
      } else if (result.modifiedCount > 0) {
        updated++;
        console.log(`  ✅ ${r.name} (${r.area}) → fotoğraf güncellendi`);
      } else {
        alreadyHas++;
      }
    }

    // Also check what's in DB without image_url
    const noPhoto = await col.countDocuments({
      $or: [
        { image_url: { $exists: false } },
        { image_url: '' },
        { image_url: null }
      ]
    });

    const total = await col.countDocuments({});

    console.log('\n── Sonuç ──');
    console.log(`Toplam DB:    ${total}`);
    console.log(`Güncellenen:  ${updated}`);
    console.log(`Zaten varmış: ${alreadyHas}`);
    console.log(`Seed'de yok:  ${notFound}`);
    console.log(`Hâlâ fotosuz: ${noPhoto}`);

  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    await client.close();
  }
}

fixPhotos();
