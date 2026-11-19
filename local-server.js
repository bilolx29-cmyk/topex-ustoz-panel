// TOPEX Ustoz Paneli — Backend Server & Hybrid Database Engine
// MongoDB Atlas (Production & Cloud) + SQLite (Local fallback)
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDb, pingDatabase, ensureIndexes, isMongoConfigured, DB_NAME } = require('./lib/mongodb');
const { callGeminiAPI, generateSmartResponse } = require('./lib/ai');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Parol shifrlash va tekshirish (scrypt algoritmi - TOPEX CRM bilan 100% bir xil)
const hash = (pw, salt = crypto.randomBytes(8).toString('hex')) =>
  salt + ':' + crypto.scryptSync(String(pw), salt, 32).toString('hex');
const verify = (pw, h) => {
  if (!h || !pw) return false;
  const [s] = String(h).split(':');
  if (!s) return false;
  return hash(pw, s) === h;
};

// ---- SQLite Fallback sozlamalari (agar MONGODB_URI berilmagan bo'lsa) ----
let sqliteDb = null;
let sqliteDbPath = null;
const sqliteSessions = new Map();

const DB_CANDIDATES = [
  process.env.CRM_DB_PATH,
  path.resolve(__dirname, '..', 'topex-crm', 'topex-crm', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', 'topex-crm', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', 'topex', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, '..', 'topex-crm', 'topup', 'data', 'app.db'),
  path.resolve(__dirname, 'data', 'app.db')
].filter(Boolean);

function initSqlite() {
  const { DatabaseSync } = require('node:sqlite');
  sqliteDbPath = DB_CANDIDATES.find(p => fs.existsSync(p));
  if (!sqliteDbPath) {
    sqliteDbPath = path.resolve(__dirname, 'data', 'app.db');
    fs.mkdirSync(path.dirname(sqliteDbPath), { recursive: true });
  }
  sqliteDb = new DatabaseSync(sqliteDbPath);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS records(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      col TEXT NOT NULL,
      data TEXT NOT NULL,
      archived INTEGER DEFAULT 0,
      archived_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_col ON records(col, archived);
  `);
}

const parseRow = r => ({
  ...JSON.parse(r.data),
  id: r.id,
  _archived: !!r.archived,
  _archivedAt: r.archived_at,
  _createdAt: r.created_at
});

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').map(s => s.trim().split('=')).filter(a => a[0])
  );
}

const send = (res, code, body, headers = {}) => {
  const isStr = typeof body === 'string' || Buffer.isBuffer(body);
  res.writeHead(code, {
    'Content-Type': isStr ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    ...headers
  });
  res.end(isStr ? body : JSON.stringify(body));
};

const readBody = req => new Promise(resolve => {
  let b = '';
  req.on('data', c => {
    b += c;
    if (b.length > 25e6) req.destroy();
  });
  req.on('end', () => {
    try {
      resolve(JSON.parse(b || '{}'));
    } catch {
      resolve({});
    }
  });
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// ---- Foydalanuvchi Sessiyasini tekshirish ----
async function userOf(req) {
  let token = '';
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    token = auth.slice(7).trim();
  } else {
    token = parseCookies(req).sid;
  }
  if (!token) return null;

  // 1. Agar MongoDB ulanishi mavjud bo'lsa
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      const sess = await db.collection('sessions').findOne({ token });
      if (!sess) return null;

      if (sess.expiresAt && new Date() > new Date(sess.expiresAt)) {
        await db.collection('sessions').deleteOne({ token });
        return null;
      }

      // Ustozning faolligini tekshirish
      const teacher = await db.collection('teachers').findOne({ id: sess.id });
      if (!teacher || teacher.active === false || teacher._archived) {
        await db.collection('sessions').deleteOne({ token });
        return null;
      }

      return { ...sess, teacher };
    } catch (e) {
      console.error("MongoDB session tekshirishda xatolik:", e.message);
      return null;
    }
  }

  // 2. Aks holda SQLite
  if (!sqliteDb) initSqlite();
  const sess = sqliteSessions.get(token);
  if (!sess) return null;

  if (sess.expiresAt && Date.now() > sess.expiresAt) {
    sqliteSessions.delete(token);
    return null;
  }

  const r = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND id=?').get('teachers', sess.id);
  if (!r) {
    sqliteSessions.delete(token);
    return null;
  }
  const teacher = parseRow(r);
  if (teacher.active === false || teacher._archived) {
    sqliteSessions.delete(token);
    return null;
  }

  return { ...sess, teacher };
}

// ==========================================================
// ASOSIY HTTP SERVER
// ==========================================================
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  try {
    // ---- API ENDPOINTLARI ----
    if (p.startsWith('/api/')) {
      const parts = p.slice(5).split('/').filter(Boolean);

      // Status
      if (parts[0] === 'status') {
        const useMongo = isMongoConfigured();
        if (useMongo) {
          const ping = await pingDatabase();
          let stats = {};
          if (ping.ok) {
            const db = await getDb();
            stats = {
              teachers: await db.collection('teachers').countDocuments({ _archived: { $ne: true } }),
              groups: await db.collection('groups').countDocuments({ _archived: { $ne: true } }),
              students: await db.collection('students').countDocuments({ _archived: { $ne: true } })
            };
          }
          return send(res, 200, {
            ok: ping.ok,
            system: 'TOPEX Ustoz Paneli API',
            engine: 'MongoDB Atlas',
            database: DB_NAME,
            stats
          });
        } else {
          if (!sqliteDb) initSqlite();
          const tCount = sqliteDb.prepare('SELECT COUNT(*) c FROM records WHERE col=? AND archived=0').get('teachers').c;
          const gCount = sqliteDb.prepare('SELECT COUNT(*) c FROM records WHERE col=? AND archived=0').get('groups').c;
          const sCount = sqliteDb.prepare('SELECT COUNT(*) c FROM records WHERE col=? AND archived=0').get('students').c;
          return send(res, 200, {
            ok: true,
            system: 'TOPEX Ustoz Paneli API',
            engine: 'SQLite (Local)',
            database: sqliteDbPath,
            stats: { teachers: tCount, groups: gCount, students: sCount }
          });
        }
      }

      // 1. LOGIN
      if (parts[0] === 'login' && req.method === 'POST') {
        const { phone, password } = await readBody(req);
        if (!phone || !password) {
          return send(res, 400, { error: "Telefon raqam yoki login, hamda parol kiritilishi shart" });
        }

        const rawPhone = String(phone).trim();
        const norm = rawPhone.replace(/\D/g, '');

        let user = null;
        let isTeacher = true;

        if (isMongoConfigured()) {
          const db = await getDb();
          await ensureIndexes(db);
          const teachers = await db.collection('teachers').find().toArray();
          user = teachers.find(t => {
            const p = String(t.phone || '').replace(/\D/g, '');
            const matchPhone = norm && (p === norm || p.endsWith(norm) || norm.endsWith(p));
            const matchLogin = t.login && String(t.login).toLowerCase() === rawPhone.toLowerCase();
            return (matchPhone || matchLogin) && t.password && verify(password, t.password);
          });

          if (!user) {
            const workers = await db.collection('workers').find().toArray();
            const worker = workers.find(w => {
              const p = String(w.phone || '').replace(/\D/g, '');
              const matchPhone = norm && (p === norm || p.endsWith(norm) || norm.endsWith(p));
              const matchLogin = w.login && String(w.login).toLowerCase() === rawPhone.toLowerCase();
              return (matchPhone || matchLogin) && w.password && verify(password, w.password);
            });
            if (worker) {
              user = worker;
              isTeacher = false;
            }
          }
        } else {
          if (!sqliteDb) initSqlite();
          const teachers = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=?').all('teachers').map(parseRow);
          user = teachers.find(t => {
            const p = String(t.phone || '').replace(/\D/g, '');
            const matchPhone = norm && (p === norm || p.endsWith(norm) || norm.endsWith(p));
            const matchLogin = t.login && String(t.login).toLowerCase() === rawPhone.toLowerCase();
            return (matchPhone || matchLogin) && t.password && verify(password, t.password);
          });

          if (!user) {
            const workers = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=?').all('workers').map(parseRow);
            const worker = workers.find(w => {
              const p = String(w.phone || '').replace(/\D/g, '');
              const matchPhone = norm && (p === norm || p.endsWith(norm) || norm.endsWith(p));
              const matchLogin = w.login && String(w.login).toLowerCase() === rawPhone.toLowerCase();
              return (matchPhone || matchLogin) && w.password && verify(password, w.password);
            });
            if (worker) {
              user = worker;
              isTeacher = false;
            }
          }
        }

        if (!user) {
          return send(res, 401, { error: "Telefon raqam yoki parol noto'g'ri. Administrator tomonidan hisob berilganligini tekshiring." });
        }

        if (user.active === false || user._archived) {
          return send(res, 403, { error: "Hisobingiz nofaol yoki administrator tomonidan bloklangan" });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const sessionData = {
          token,
          id: user.id,
          fullname: user.fullname,
          phone: user.phone,
          isTeacher,
          expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000)
        };

        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('sessions').insertOne(sessionData);
        } else {
          sqliteSessions.set(token, { ...sessionData, expiresAt: Date.now() + 30 * 24 * 3600 * 1000 });
        }

        return send(res, 200, {
          ok: true,
          token,
          user: {
            id: user.id,
            fullname: user.fullname,
            phone: user.phone,
            isTeacher
          }
        }, {
          'Set-Cookie': `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        });
      }

      // 2. LOGOUT
      if (parts[0] === 'logout') {
        let token = '';
        const auth = req.headers.authorization || '';
        if (auth.startsWith('Bearer ')) token = auth.slice(7).trim();
        else token = parseCookies(req).sid;

        if (token) {
          if (isMongoConfigured()) {
            const db = await getDb();
            await db.collection('sessions').deleteOne({ token });
          } else {
            sqliteSessions.delete(token);
          }
        }
        return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; Path=/; Max-Age=0' });
      }

      // ---- Himoyalangan endpointlar ----
      const sessionUser = await userOf(req);
      if (!sessionUser) {
        return send(res, 401, { error: "Avtorizatsiyadan o'tilmagan yoki hisobingiz bloklangan. Iltimos, tizimga qayta kiring." });
      }

      // 3. ME
      if (parts[0] === 'me' && req.method === 'GET') {
        return send(res, 200, {
          ok: true,
          user: {
            id: sessionUser.id,
            fullname: sessionUser.fullname,
            phone: sessionUser.phone,
            isTeacher: sessionUser.isTeacher
          }
        });
      }

      // 4. TEACHER DATA
      if (parts[0] === 'teacher' && parts[1] === 'data' && req.method === 'GET') {
        const teacherId = sessionUser.id;

        if (isMongoConfigured()) {
          const db = await getDb();
          const teacherRec = await db.collection('teachers').findOne({ id: teacherId });
          const teacherData = teacherRec ? { ...teacherRec } : { id: teacherId, fullname: sessionUser.fullname, phone: sessionUser.phone };
          delete teacherData.password;
          delete teacherData._id;

          const groups = await db.collection('groups').find({ teacherId: Number(teacherId), _archived: { $ne: true } }).toArray();
          const groupIds = new Set(groups.map(g => Number(g.id)));

          const allEnr = await db.collection('enrollments').find({ _archived: { $ne: true } }).toArray();
          const groupEnr = allEnr.filter(e => groupIds.has(Number(e.groupId)));
          const enrolledStudentIds = new Set(groupEnr.map(e => Number(e.studentId)));

          const allStudents = await db.collection('students').find({ _archived: { $ne: true } }).toArray();
          const students = allStudents.filter(s => enrolledStudentIds.has(Number(s.id))).map(s => {
            const enr = groupEnr.find(e => Number(e.studentId) === Number(s.id));
            return {
              ...s,
              groupId: enr ? enr.groupId : (groups[0] ? groups[0].id : null),
              name: s.fullname || s.name,
              status: s.balance < 0 ? 'qarzdor' : 'faol'
            };
          });

          const allAtt = await db.collection('attendance').find({ _archived: { $ne: true } }).toArray();
          const attendanceMap = {};
          allAtt.forEach(a => {
            if (groupIds.has(Number(a.groupId))) {
              const key = a.groupId + '|' + a.date;
              if (!attendanceMap[key]) attendanceMap[key] = {};
              if (a.records && typeof a.records === 'object') {
                Object.assign(attendanceMap[key], a.records);
              } else if (a.studentId) {
                attendanceMap[key][a.studentId] = (a.status || 'keldi').toLowerCase();
              }
            }
          });

          const allGrades = await db.collection('grades').find({ _archived: { $ne: true } }).toArray();
          const gradesMap = {};
          allGrades.forEach(g => {
            if (groupIds.has(Number(g.groupId))) {
              const k = (g.key || `${g.studentId}|${g.date}`);
              gradesMap[k] = g.grade;
            }
          });

          const homework = await db.collection('homework').find({ teacherId: Number(teacherId), _archived: { $ne: true } }).toArray();
          const announcements = await db.collection('announcements').find({ _archived: { $ne: true } }).toArray();

          return send(res, 200, {
            ok: true,
            teacher: {
              ...teacherData,
              name: teacherData.fullname,
              title: teacherData.title || "Katta o'qituvchi / Topex Texnikum",
              room: teacherData.room || "3-bino, 302-auditoriya",
              experience: teacherData.experience || "3+ yil",
              telegram: teacherData.telegram || (teacherData.tgChatId ? '@' + teacherData.tgChatId : ''),
              hoursPerWeek: teacherData.hoursPerWeek || 24,
              salary: teacherData.salary || 0,
              salaryBreakdown: teacherData.salaryBreakdown || { base: teacherData.salary || 5000000, kpi: 800000, bonus: 400000, tax: 600000 }
            },
            groups: groups.map(g => ({
              ...g,
              room: g.room || g.roomId || "304-laboratoriya",
              days: Array.isArray(g.days) ? g.days.map(d => {
                const map = { 'Dushanba': 1, 'Seshanba': 2, 'Chorshanba': 3, 'Payshanba': 4, 'Juma': 5, 'Shanba': 6, 'Yakshanba': 7 };
                return typeof d === 'string' ? (map[d] || 1) : d;
              }) : [1, 3, 5],
              time: (g.timeFrom && g.timeTo) ? `${g.timeFrom} - ${g.timeTo}` : (g.time || '09:00 - 10:30'),
              course: g.course || g.name,
              color: g.color || '#6366f1',
              badge: g.active === false ? 'Yopilgan' : 'Faol',
              capacity: g.capacity || 20
            })),
            students,
            attendance: attendanceMap,
            grades: gradesMap,
            homework,
            announcements,
            settings: { soundEnabled: true, compactMode: false, autoSave: true }
          });
        }

        // SQLite rejimi
        const teacherRec = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND id=?').get('teachers', teacherId);
        const teacherData = teacherRec ? parseRow(teacherRec) : { id: teacherId, fullname: sessionUser.fullname, phone: sessionUser.phone };
        delete teacherData.password;

        const allGroups = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('groups').map(parseRow);
        const groups = allGroups.filter(g => Number(g.teacherId) === Number(teacherId));
        const groupIds = new Set(groups.map(g => Number(g.id)));

        const allEnr = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('enrollments').map(parseRow);
        const groupEnr = allEnr.filter(e => groupIds.has(Number(e.groupId)));
        const enrolledStudentIds = new Set(groupEnr.map(e => Number(e.studentId)));

        const allStudents = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('students').map(parseRow);
        const students = allStudents.filter(s => enrolledStudentIds.has(Number(s.id))).map(s => {
          const enr = groupEnr.find(e => Number(e.studentId) === Number(s.id));
          return {
            ...s,
            groupId: enr ? enr.groupId : (groups[0] ? groups[0].id : null),
            name: s.fullname || s.name,
            status: s.balance < 0 ? 'qarzdor' : 'faol'
          };
        });

        const allAtt = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('attendance').map(parseRow);
        const attendanceMap = {};
        allAtt.forEach(a => {
          if (groupIds.has(Number(a.groupId))) {
            const key = a.groupId + '|' + a.date;
            if (!attendanceMap[key]) attendanceMap[key] = {};
            if (a.records && typeof a.records === 'object') {
              Object.assign(attendanceMap[key], a.records);
            } else if (a.studentId) {
              attendanceMap[key][a.studentId] = (a.status || 'keldi').toLowerCase();
            }
          }
        });

        const allGrades = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('grades').map(parseRow);
        const gradesMap = {};
        allGrades.forEach(g => {
          if (groupIds.has(Number(g.groupId))) {
            const k = (g.key || `${g.studentId}|${g.date}`);
            gradesMap[k] = g.grade;
          }
        });

        const allHw = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('homework').map(parseRow);
        const homework = allHw.filter(h => groupIds.has(Number(h.groupId)));
        const announcements = sqliteDb.prepare('SELECT id,data,archived,archived_at,created_at FROM records WHERE col=? AND archived=0').all('announcements').map(parseRow);

        return send(res, 200, {
          ok: true,
          teacher: {
            ...teacherData,
            name: teacherData.fullname,
            title: teacherData.title || "Katta o'qituvchi / Topex Texnikum",
            room: teacherData.room || "3-bino, 302-auditoriya",
            experience: teacherData.experience || "3+ yil",
            telegram: teacherData.telegram || (teacherData.tgChatId ? '@' + teacherData.tgChatId : ''),
            hoursPerWeek: teacherData.hoursPerWeek || 24,
            salary: teacherData.salary || 0,
            salaryBreakdown: teacherData.salaryBreakdown || { base: teacherData.salary || 5000000, kpi: 800000, bonus: 400000, tax: 600000 }
          },
          groups: groups.map(g => ({
            ...g,
            room: g.room || g.roomId || "304-laboratoriya",
            days: Array.isArray(g.days) ? g.days.map(d => {
              const map = { 'Dushanba': 1, 'Seshanba': 2, 'Chorshanba': 3, 'Payshanba': 4, 'Juma': 5, 'Shanba': 6, 'Yakshanba': 7 };
              return typeof d === 'string' ? (map[d] || 1) : d;
            }) : [1, 3, 5],
            time: (g.timeFrom && g.timeTo) ? `${g.timeFrom} - ${g.timeTo}` : (g.time || '09:00 - 10:30'),
            course: g.course || g.name,
            color: g.color || '#6366f1',
            badge: g.active === false ? 'Yopilgan' : 'Faol',
            capacity: g.capacity || 20
          })),
          students,
          attendance: attendanceMap,
          grades: gradesMap,
          homework,
          announcements,
          settings: { soundEnabled: true, compactMode: false, autoSave: true }
        });
      }

      // 5. ATTENDANCE (POST)
      if (parts[0] === 'attendance' && req.method === 'POST') {
        const { groupId, date, records } = await readBody(req);
        if (!groupId || !date || !records) {
          return send(res, 400, { error: "groupId, date va records kiritilishi shart" });
        }

        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('attendance').updateOne(
            { groupId: Number(groupId), date },
            {
              $set: { groupId: Number(groupId), date, teacherId: sessionUser.id, records, updatedAt: new Date().toISOString() },
              $setOnInsert: { id: Date.now(), createdAt: new Date().toISOString() }
            },
            { upsert: true }
          );
        } else {
          const existing = sqliteDb.prepare('SELECT id,data FROM records WHERE col=? AND archived=0').all().map(parseRow).find(a => Number(a.groupId) === Number(groupId) && a.date === date);
          if (existing) {
            const merged = { ...existing, records: { ...(existing.records || {}), ...records }, updatedAt: new Date().toISOString() };
            sqliteDb.prepare('UPDATE records SET data=? WHERE col=? AND id=?').run(JSON.stringify(merged), existing.id);
          } else {
            sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('attendance', JSON.stringify({
              groupId: Number(groupId),
              teacherId: sessionUser.id,
              date,
              records,
              createdAt: new Date().toISOString()
            }));
          }
        }
        return send(res, 200, { ok: true, savedAt: new Date().toISOString() });
      }

      // 6. GRADES (POST)
      if (parts[0] === 'grades' && req.method === 'POST') {
        const { groupId, studentId, date, grade, key, note } = await readBody(req);
        if (!groupId || !studentId) {
          return send(res, 400, { error: "groupId va studentId kiritilishi shart" });
        }
        const k = key || `${studentId}|${date}`;

        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('grades').updateOne(
            { groupId: Number(groupId), key: k },
            {
              $set: { groupId: Number(groupId), studentId: Number(studentId), teacherId: sessionUser.id, date: date || new Date().toISOString().slice(0, 10), grade, key: k, note: note || '', updatedAt: new Date().toISOString() },
              $setOnInsert: { id: Date.now(), createdAt: new Date().toISOString() }
            },
            { upsert: true }
          );
        } else {
          const existing = sqliteDb.prepare('SELECT id,data FROM records WHERE col=? AND archived=0').all().map(parseRow).find(g => Number(g.groupId) === Number(groupId) && (g.key === k || (Number(g.studentId) === Number(studentId) && g.date === date)));
          if (existing) {
            const updated = { ...existing, grade, key: k, note: note || existing.note, updatedAt: new Date().toISOString() };
            sqliteDb.prepare('UPDATE records SET data=? WHERE col=? AND id=?').run(JSON.stringify(updated), existing.id);
          } else {
            sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('grades', JSON.stringify({
              groupId: Number(groupId),
              studentId: Number(studentId),
              teacherId: sessionUser.id,
              date: date || new Date().toISOString().slice(0, 10),
              grade,
              key: k,
              note: note || '',
              createdAt: new Date().toISOString()
            }));
          }
        }
        return send(res, 200, { ok: true });
      }

      // 7. HOMEWORK
      if (parts[0] === 'homework' && req.method === 'POST') {
        const body = await readBody(req);
        const nid = Date.now();
        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('homework').insertOne({ ...body, id: nid, teacherId: sessionUser.id, done: body.done || {}, createdAt: new Date().toISOString() });
        } else {
          const r = sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('homework', JSON.stringify({ ...body, teacherId: sessionUser.id, done: body.done || {}, createdAt: new Date().toISOString() }));
          return send(res, 201, { ok: true, id: Number(r.lastInsertRowid) });
        }
        return send(res, 201, { ok: true, id: nid });
      }

      if (parts[0] === 'homework' && parts[1] === 'toggle' && req.method === 'POST') {
        const { homeworkId, studentId, done } = await readBody(req);
        if (isMongoConfigured()) {
          const db = await getDb();
          const hw = await db.collection('homework').findOne({ id: Number(homeworkId) });
          if (hw) {
            const d = hw.done || {};
            if (done) d[studentId] = true;
            else delete d[studentId];
            await db.collection('homework').updateOne({ id: Number(homeworkId) }, { $set: { done: d, updatedAt: new Date().toISOString() } });
          }
        } else {
          const r = sqliteDb.prepare('SELECT id,data FROM records WHERE col=? AND id=?').get(homeworkId);
          if (r) {
            const hw = parseRow(r);
            hw.done = hw.done || {};
            if (done) hw.done[studentId] = true;
            else delete hw.done[studentId];
            sqliteDb.prepare('UPDATE records SET data=? WHERE col=? AND id=?').run(JSON.stringify(hw), homeworkId);
          }
        }
        return send(res, 200, { ok: true });
      }

      if (parts[0] === 'homework' && parts[1] && req.method === 'DELETE') {
        const hwId = Number(parts[1]);
        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('homework').deleteOne({ id: hwId });
        } else {
          sqliteDb.prepare('DELETE FROM records WHERE col=? AND id=?').run(hwId);
        }
        return send(res, 200, { ok: true });
      }

      // 8. STUDENT
      if (parts[0] === 'student' && req.method === 'POST') {
        const body = await readBody(req);
        const { name, fullname, phone, groupId, birth, parentName } = body;
        const studentName = fullname || name;
        if (!studentName || !phone) {
          return send(res, 400, { error: "O'quvchi ismi va telefon raqami kiritilishi shart" });
        }

        const sid = Date.now();
        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('students').insertOne({
            id: sid,
            fullname: studentName,
            phone,
            birth: birth || '2008-01-01',
            gender: body.gender || 'Erkak',
            balance: Number(body.balance) || 0,
            father: parentName || '',
            note: body.note || '',
            createdAt: new Date().toISOString()
          });

          if (groupId) {
            await db.collection('enrollments').insertOne({
              id: Date.now() + 1,
              studentId: sid,
              groupId: Number(groupId),
              joinedAt: new Date().toISOString().slice(0, 10),
              status: 'Aktiv',
              createdAt: new Date().toISOString()
            });
          }
        } else {
          const r = sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('students', JSON.stringify({
            fullname: studentName,
            phone,
            birth: birth || '2008-01-01',
            gender: body.gender || 'Erkak',
            balance: Number(body.balance) || 0,
            father: parentName || '',
            note: body.note || '',
            createdAt: new Date().toISOString()
          }));
          const newSid = Number(r.lastInsertRowid);
          if (groupId) {
            sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('enrollments', JSON.stringify({
              studentId: newSid,
              groupId: Number(groupId),
              joinedAt: new Date().toISOString().slice(0, 10),
              status: 'Aktiv',
              createdAt: new Date().toISOString()
            }));
          }
          return send(res, 201, { ok: true, id: newSid });
        }

        return send(res, 201, { ok: true, id: sid });
      }

      if (parts[0] === 'student' && parts[1] && req.method === 'PUT') {
        const sid = Number(parts[1]);
        const body = await readBody(req);
        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('students').updateOne(
            { id: sid },
            { $set: { fullname: body.fullname || body.name, phone: body.phone, father: body.parentName, balance: body.balance !== undefined ? Number(body.balance) : 0, updatedAt: new Date().toISOString() } }
          );
        } else {
          const r = sqliteDb.prepare('SELECT id,data FROM records WHERE col=? AND id=?').get(sid);
          if (r) {
            const current = parseRow(r);
            const updated = { ...current, fullname: body.fullname || body.name || current.fullname, phone: body.phone || current.phone, father: body.parentName || current.father, balance: body.balance !== undefined ? Number(body.balance) : current.balance, updatedAt: new Date().toISOString() };
            sqliteDb.prepare('UPDATE records SET data=? WHERE col=? AND id=?').run(JSON.stringify(updated), sid);
          }
        }
        return send(res, 200, { ok: true });
      }

      if (parts[0] === 'student' && parts[1] && req.method === 'DELETE') {
        const sid = Number(parts[1]);
        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('students').updateOne({ id: sid }, { $set: { _archived: true, archivedAt: new Date().toISOString() } });
        } else {
          sqliteDb.prepare("UPDATE records SET archived=1, archived_at=datetime('now') WHERE col=? AND id=?").run(sid);
        }
        return send(res, 200, { ok: true });
      }

      // 9. GROUPS
      if (parts[0] === 'groups' && req.method === 'POST') {
        const body = await readBody(req);
        const gid = Date.now();
        const daysArr = Array.isArray(body.days) ? body.days : [1, 3, 5];
        const daysMap = { 1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba', 7: 'Yakshanba' };
        const daysText = daysArr.map(d => typeof d === 'number' ? (daysMap[d] || 'Dushanba') : d);

        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('groups').insertOne({
            id: gid,
            name: body.name,
            course: body.course || body.name,
            teacherId: sessionUser.id,
            roomId: body.room || '304-laboratoriya',
            time: body.time || '09:00 - 10:30',
            days: daysText,
            capacity: body.capacity || 20,
            color: body.color || '#6366f1',
            active: true,
            createdAt: new Date().toISOString()
          });
        } else {
          const r = sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('groups', JSON.stringify({
            name: body.name,
            course: body.course || body.name,
            teacherId: sessionUser.id,
            roomId: body.room || '304-laboratoriya',
            time: body.time || '09:00 - 10:30',
            days: daysText,
            capacity: body.capacity || 20,
            color: body.color || '#6366f1',
            active: true,
            createdAt: new Date().toISOString()
          }));
          return send(res, 201, { ok: true, id: Number(r.lastInsertRowid) });
        }
        return send(res, 201, { ok: true, id: gid });
      }

      // 10. PROFILE
      if (parts[0] === 'teacher' && parts[1] === 'profile' && req.method === 'PUT') {
        const body = await readBody(req);
        delete body.password;
        delete body.id;
        delete body._id;

        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('teachers').updateOne({ id: sessionUser.id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
        } else {
          const r = sqliteDb.prepare('SELECT id,data FROM records WHERE col=? AND id=?').get(sessionUser.id);
          if (r) {
            const current = parseRow(r);
            const updated = { ...current, ...body, updatedAt: new Date().toISOString() };
            sqliteDb.prepare('UPDATE records SET data=? WHERE col=? AND id=?').run(JSON.stringify(updated), sessionUser.id);
          }
        }
        return send(res, 200, { ok: true });
      }

      // 11. PASSWORD
      if (parts[0] === 'teacher' && parts[1] === 'password' && req.method === 'POST') {
        const { currentPassword, newPassword } = await readBody(req);
        if (!newPassword || newPassword.length < 6) {
          return send(res, 400, { error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" });
        }

        if (isMongoConfigured()) {
          const db = await getDb();
          const teacher = await db.collection('teachers').findOne({ id: sessionUser.id });
          if (!teacher || !verify(currentPassword, teacher.password)) {
            return send(res, 400, { error: "Amaldagi parol noto'g'ri" });
          }
          await db.collection('teachers').updateOne({ id: sessionUser.id }, { $set: { password: hash(newPassword), updatedAt: new Date().toISOString() } });
        } else {
          const r = sqliteDb.prepare('SELECT id,data FROM records WHERE col=? AND id=?').get(sessionUser.id);
          if (!r) return send(res, 404, { error: "O'qituvchi topilmadi" });
          const teacher = parseRow(r);
          if (teacher.password && !verify(currentPassword, teacher.password)) {
            return send(res, 400, { error: "Amaldagi parol noto'g'ri" });
          }
          teacher.password = hash(newPassword);
          sqliteDb.prepare('UPDATE records SET data=? WHERE col=? AND id=?').run(JSON.stringify(teacher), sessionUser.id);
        }
        return send(res, 200, { ok: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
      }

      // 12. AI CHAT (Sun'iy Intellekt)
      if (parts[0] === 'ai' && parts[1] === 'chat' && req.method === 'POST') {
        const body = await readBody(req);
        const message = body.message || body.text || '';
        const context = {
          teacherName: sessionUser.fullname || 'Ustoz',
          groupName: body.groupName || 'Topex guruhi',
          groupId: body.groupId || ''
        };

        let reply = null;
        if (process.env.GEMINI_API_KEY) {
          reply = await callGeminiAPI(message, `Siz TOPEX Texnikumi o'qituvchisiga yordam beruvchi Topex AI yordamchisisiz. Ustoz: ${context.teacherName}, Guruh: ${context.groupName}. Javoblarni chiroyli, aniq, pedagogik va o'zbek tilida bering.`);
        }

        if (!reply) {
          reply = generateSmartResponse(message, context);
        }

        return send(res, 200, { ok: true, reply, t: Date.now() });
      }

      // 13. CHATS (Tarix va yangi xabarlar)
      if (parts[0] === 'chats' && req.method === 'POST') {
        const body = await readBody(req);
        const { chatId, message: msg } = body;
        if (!chatId || !msg) {
          return send(res, 400, { error: "chatId va message kiritilishi shart" });
        }
        const record = {
          chatId: String(chatId),
          teacherId: sessionUser.id,
          from: msg.from || 'me',
          sender: msg.sender || sessionUser.fullname,
          text: msg.text || '',
          t: msg.t || Date.now(),
          createdAt: new Date().toISOString()
        };

        if (isMongoConfigured()) {
          const db = await getDb();
          await db.collection('chats').insertOne(record);
        } else {
          sqliteDb.prepare('INSERT INTO records(col,data) VALUES(?,?)').run('chats', JSON.stringify(record));
        }
        return send(res, 201, { ok: true });
      }

      return send(res, 404, { error: "Endpoint topilmadi" });
    }

    // ---- STATIK FAYLLAR ----
    let reqPath = decodeURI(p);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(PUBLIC_DIR, reqPath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      return send(res, 403, 'Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        return send(res, 404, '404 Topilmadi');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      fs.createReadStream(filePath).pipe(res);
    });

  } catch (err) {
    console.error('Server xatoligi:', err);
    return send(res, 500, { error: 'Ichki server xatoligi yuz berdi' });
  }
});

server.listen(PORT, async () => {
  console.log(`\n🚀 Topex Ustoz Paneli serveri ishga tushdi: http://localhost:${PORT}/`);
  if (isMongoConfigured()) {
    const ping = await pingDatabase();
    if (ping.ok) {
      console.log(`🔗 Database: MongoDB Atlas [${DB_NAME}] (ONLINE)\n`);
    } else {
      console.warn(`⚠️ MongoDB Atlas ulanishida muammo: ${ping.error}\n`);
    }
  } else {
    initSqlite();
    console.log(`🔗 Database: SQLite (Lokal rejim) [${sqliteDbPath}]\n`);
    console.log(`ℹ️ MongoDB Atlas'ga ulash uchun .env faylida MONGODB_URI=... sozlang.\n`);
  }
});
