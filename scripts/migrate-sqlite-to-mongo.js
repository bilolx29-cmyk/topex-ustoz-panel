// TOPEX — SQLite to MongoDB Atlas Migration Script
// Xavfsiz, ma'lumotlarni yo'qotmaydigan va dublikat yaratmaydigan migratsiya
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { getDb, ensureIndexes, isMongoConfigured, pingDatabase, DB_NAME } = require('../lib/mongodb');

const DB_CANDIDATES = [
  process.env.CRM_DB_PATH,
  path.resolve(__dirname, '..', '..', 'topex-crm', 'topex-crm', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', '..', 'topex-crm', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', '..', 'topex', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', '..', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', 'data', 'app.db')
].filter(Boolean);

async function runMigration() {
  console.log('====================================================');
  console.log('   TOPEX -> MONGODB ATLAS MIGRATSIYA BOSQICHI       ');
  console.log('====================================================\n');

  // 1. MongoDB ulanishini tekshirish
  if (!isMongoConfigured()) {
    console.error('XATOLIK: MONGODB_URI muhit o\'zgaruvchisi topilmadi!');
    console.error('Iltimos, .env faylida MONGODB_URI=mongodb+srv://... sozlang.');
    process.exit(1);
  }

  console.log('[1/5] MongoDB Atlas bilan aloqa tekshirilmoqda...');
  const ping = await pingDatabase();
  if (!ping.ok) {
    console.error('XATOLIK: MongoDB Atlas ga ulanib bo\'lmadi:', ping.error);
    process.exit(1);
  }
  console.log(`✓ MongoDB Atlas ulandi! Database: "${DB_NAME}"`);

  // 2. SQLite bazani qidirish
  const dbPath = DB_CANDIDATES.find(p => fs.existsSync(p));
  if (!dbPath) {
    console.error('XATOLIK: SQLite ma\'lumotlar bazasi topilmadi!');
    process.exit(1);
  }
  console.log(`\n[2/5] SQLite bazasi aniqlandi: ${dbPath}`);

  // 3. Backup yaratish
  const backupPath = dbPath + '.backup-pre-mongo-' + Date.now();
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✓ SQLite zaxira nusxasi (backup) olindi: ${path.basename(backupPath)}`);
  } catch (err) {
    console.warn('Ogohlantirish: Backup olishda muammo:', err.message);
  }

  // 4. SQLite ma'lumotlarini o'qish
  const sqliteDb = new DatabaseSync(dbPath);
  const rawRows = sqliteDb.prepare('SELECT id, col, data, archived, archived_at, created_at FROM records ORDER BY id').all();
  console.log(`✓ SQLite'da jami yozuvlar: ${rawRows.length} ta`);

  const collections = {};
  for (const r of rawRows) {
    if (!collections[r.col]) collections[r.col] = [];
    try {
      const parsed = JSON.parse(r.data);
      collections[r.col].push({
        ...parsed,
        id: Number(r.id),
        _archived: !!r.archived,
        _archivedAt: r.archived_at || null,
        _createdAt: r.created_at || (parsed.createdAt || new Date().toISOString())
      });
    } catch (e) {
      console.warn(`Xatolik row ${r.id} (${r.col}):`, e.message);
    }
  }

  // 5. MongoDB ga indekslarni qo'llash va yozish
  console.log('\n[3/5] MongoDB indekslari sozlanmoqda...');
  const mongoDb = await getDb();
  await ensureIndexes(mongoDb);

  console.log('\n[4/5] Ma\'lumotlar MongoDB ga xavfsiz ko\'chirilmoqda (upsert)...');
  const stats = [];

  for (const colName of Object.keys(collections)) {
    const docs = collections[colName];
    const col = mongoDb.collection(colName);

    let inserted = 0;
    let updated = 0;

    for (const doc of docs) {
      const res = await col.updateOne(
        { id: doc.id },
        { $set: doc },
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }

    const mongoCount = await col.countDocuments();
    stats.push({
      Kolleksiya: colName,
      'SQLite soni': docs.length,
      'MongoDB soni': mongoCount,
      Holat: docs.length === mongoCount ? '✓ To\'liq' : 'E\'tibor bering'
    });
  }

  console.log('\n[5/5] Yakuniy solishtirish hisoboti:');
  console.table(stats);

  console.log('\n====================================================');
  console.log('✓ MIGRATSIYA MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('====================================================\n');
  process.exit(0);
}

if (require.main === module) {
  runMigration().catch(err => {
    console.error('Migratsiya jarayonida kutilmagan xatolik:', err);
    process.exit(1);
  });
}

module.exports = { runMigration };
