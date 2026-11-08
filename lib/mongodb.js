// TOPEX Ustoz Paneli — MongoDB Atlas Client & Connection Pooling
// Vercel Serverless va doimiy server muhitiga to'liq moslangan
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'topex';

let client = null;
let clientPromise = null;

if (uri) {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  };

  if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
    // Lokal yoki development muhitda global o'zgaruvchidan foydalanamiz
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // Vercel serverless production muhiti
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

/**
 * MongoDB bazasiga ulanishni olish
 */
async function getDb() {
  if (!clientPromise) {
    throw new Error("MONGODB_URI muhit o'zgaruvchisi (environment variable) topilmadi");
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(DB_NAME);
}

/**
 * MongoDB ulanishini tekshirish (Ping)
 */
async function pingDatabase() {
  if (!uri) return { ok: false, error: "MONGODB_URI sozlanmagan" };
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return { ok: true, database: DB_NAME };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Kerakli indekslarni va cheklovlarni yaratish
 */
let indexesCreated = false;
async function ensureIndexes(db) {
  if (indexesCreated) return;
  try {
    // 1. Teachers
    await db.collection('teachers').createIndex({ id: 1 }, { unique: true });
    await db.collection('teachers').createIndex({ phone: 1 });
    await db.collection('teachers').createIndex({ active: 1 });

    // 2. Groups
    await db.collection('groups').createIndex({ id: 1 }, { unique: true });
    await db.collection('groups').createIndex({ teacherId: 1 });

    // 3. Students
    await db.collection('students').createIndex({ id: 1 }, { unique: true });
    await db.collection('students').createIndex({ phone: 1 });

    // 4. Enrollments
    await db.collection('enrollments').createIndex({ id: 1 }, { unique: true });
    await db.collection('enrollments').createIndex({ studentId: 1, groupId: 1 });

    // 5. Attendance
    await db.collection('attendance').createIndex({ id: 1 }, { unique: true });
    await db.collection('attendance').createIndex({ groupId: 1, date: 1 });

    // 6. Grades
    await db.collection('grades').createIndex({ id: 1 }, { unique: true });
    await db.collection('grades').createIndex({ groupId: 1, studentId: 1, date: 1 });
    await db.collection('grades').createIndex({ key: 1 });

    // 7. Homework
    await db.collection('homework').createIndex({ id: 1 }, { unique: true });
    await db.collection('homework').createIndex({ groupId: 1 });
    await db.collection('homework').createIndex({ teacherId: 1 });

    // 8. Sessions (TTL Index bilan - muddati o'tgan sessiyalar MongoDB tomonidan avtomatik tozalanadi!)
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // 9. Workers (Admin va xodimlar)
    await db.collection('workers').createIndex({ id: 1 }, { unique: true });
    await db.collection('workers').createIndex({ phone: 1 });

    indexesCreated = true;
    console.log("[MongoDB] Barcha indekslar muvaffaqiyatli tekshirildi/yaratildi.");
  } catch (err) {
    console.warn("[MongoDB] Indekslarni yaratishda ogohlantirish:", err.message);
  }
}

module.exports = {
  getDb,
  pingDatabase,
  ensureIndexes,
  isMongoConfigured: () => !!uri,
  DB_NAME
};
