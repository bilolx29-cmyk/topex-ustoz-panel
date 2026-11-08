// TOPEX Ustoz Paneli — Vercel Serverless API (MongoDB Atlas Production Gateway)
require('dotenv').config();
const crypto = require('crypto');
const { getDb, pingDatabase, ensureIndexes, isMongoConfigured, DB_NAME } = require('../lib/mongodb');
const { callGeminiAPI, generateSmartResponse } = require('../lib/ai');

// Parol shifrlash va tekshirish (scrypt — TOPEX CRM bilan 100% bir xil)
const hash = (pw, salt = crypto.randomBytes(8).toString('hex')) =>
  salt + ':' + crypto.scryptSync(String(pw), salt, 32).toString('hex');
const verify = (pw, h) => {
  if (!h || !pw) return false;
  const [s] = String(h).split(':');
  if (!s) return false;
  return hash(pw, s) === h;
};

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').map(s => s.trim().split('=')).filter(a => a[0])
  );
}

// Xavfsiz foydalanuvchi sessiyasini tekshirish (MongoDB orqali)
async function getSessionUser(db, req) {
  let token = '';
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    token = auth.slice(7).trim();
  } else {
    token = parseCookies(req).sid;
  }
  if (!token) return null;

  const session = await db.collection('sessions').findOne({ token });
  if (!session) return null;

  // Sessiya muddati tekshiruvi
  if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
    await db.collection('sessions').deleteOne({ token });
    return null;
  }

  // Ustoz hali ham bazada mavjud va faol ekanligini REAL VAQTDA tekshirish
  const teacher = await db.collection('teachers').findOne({ id: session.id });
  if (!teacher || teacher.active === false || teacher._archived) {
    await db.collection('sessions').deleteOne({ token });
    return null;
  }

  return { ...session, teacher };
}

module.exports = async (req, res) => {
  // CORS sarlavhalari
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.replace(/^\/api\/?/, '');
  const parts = pathname.split('/').filter(Boolean);

  // Status endpointi (MongoDB ulanishini tekshirish)
  if (parts[0] === 'status') {
    const mongoReady = isMongoConfigured();
    if (!mongoReady) {
      return res.status(200).json({
        ok: false,
        system: 'TOPEX Ustoz Paneli API',
        environment: 'Vercel Serverless',
        database: 'MongoDB Atlas sozlanmagan (MONGODB_URI kerak)',
        time: new Date().toISOString()
      });
    }

    const ping = await pingDatabase();
    let stats = null;
    if (ping.ok) {
      try {
        const db = await getDb();
        await ensureIndexes(db);
        stats = {
          teachers: await db.collection('teachers').countDocuments({ _archived: { $ne: true } }),
          groups: await db.collection('groups').countDocuments({ _archived: { $ne: true } }),
          students: await db.collection('students').countDocuments({ _archived: { $ne: true } })
        };
      } catch (e) {}
    }

    return res.status(200).json({
      ok: ping.ok,
      system: 'TOPEX Ustoz Paneli API',
      environment: 'Vercel Serverless / Production',
      database: ping.ok ? `MongoDB Atlas: ${DB_NAME}` : 'Ulanishda xatolik',
      stats,
      time: new Date().toISOString()
    });
  }

  // Agar MongoDB konfiguratsiya qilinmagan bo'lsa
  if (!isMongoConfigured()) {
    return res.status(503).json({
      error: "Ma'lumotlar bazasi ulanmagan. Iltimos, Vercel sozlamalarida MONGODB_URI muhit o'zgaruvchisini kiriting."
    });
  }

  try {
    const db = await getDb();
    await ensureIndexes(db);

    // 1. LOGIN (Kirish)
    if (parts[0] === 'login' && req.method === 'POST') {
      const { phone, password } = req.body || {};
      if (!phone || !password) {
        return res.status(400).json({ error: "Telefon raqam yoki login, hamda parol kiritilishi shart" });
      }

      const rawPhone = String(phone).trim();
      const norm = rawPhone.replace(/\D/g, '');

      // O'qituvchilarni qidirish
      const teachers = await db.collection('teachers').find().toArray();
      let user = teachers.find(t => {
        const p = String(t.phone || '').replace(/\D/g, '');
        const matchPhone = norm && (p === norm || p.endsWith(norm) || norm.endsWith(p));
        const matchLogin = t.login && String(t.login).toLowerCase() === rawPhone.toLowerCase();
        return (matchPhone || matchLogin) && t.password && verify(password, t.password);
      });

      let isTeacher = true;

      // Agar ustoz topilmasa, admin/ishchi hisobi tekshiriladi
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

      if (!user) {
        return res.status(401).json({
          error: "Telefon raqam yoki parol noto'g'ri. Administrator tomonidan hisob berilganligini tekshiring."
        });
      }

      if (user.active === false || user._archived) {
        return res.status(403).json({ error: "Hisobingiz nofaol yoki administrator tomonidan bloklangan" });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 kun

      await db.collection('sessions').insertOne({
        token,
        id: user.id,
        fullname: user.fullname,
        phone: user.phone,
        isTeacher,
        expiresAt,
        createdAt: new Date()
      });

      res.setHeader('Set-Cookie', `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
      return res.status(200).json({
        ok: true,
        token,
        user: {
          id: user.id,
          fullname: user.fullname,
          phone: user.phone,
          isTeacher
        }
      });
    }

    // 2. LOGOUT (Chiqish)
    if (parts[0] === 'logout') {
      let token = '';
      const auth = req.headers.authorization || '';
      if (auth.startsWith('Bearer ')) token = auth.slice(7).trim();
      else token = parseCookies(req).sid;

      if (token) {
        await db.collection('sessions').deleteOne({ token });
      }
      res.setHeader('Set-Cookie', 'sid=; Path=/; Max-Age=0');
      return res.status(200).json({ ok: true });
    }

    // ---- Qolgan barcha endpointlar uchun sessiya talab qilinadi ----
    const sessionUser = await getSessionUser(db, req);
    if (!sessionUser) {
      return res.status(401).json({
        error: "Avtorizatsiyadan o'tilmagan yoki hisobingiz bloklangan. Iltimos, tizimga qayta kiring."
      });
    }

    // 3. ME (Joriy profil)
    if (parts[0] === 'me' && req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        user: {
          id: sessionUser.id,
          fullname: sessionUser.fullname,
          phone: sessionUser.phone,
          isTeacher: sessionUser.isTeacher
        }
      });
    }

    // 4. TEACHER DATA (Barcha ma'lumotlar)
    if (parts[0] === 'teacher' && parts[1] === 'data' && req.method === 'GET') {
      const teacherId = sessionUser.id;
      const teacherRec = await db.collection('teachers').findOne({ id: teacherId });
      const teacherData = teacherRec ? { ...teacherRec } : { id: teacherId, fullname: sessionUser.fullname, phone: sessionUser.phone };
      delete teacherData.password;
      delete teacherData._id;

      // Guruhlar
      const groups = await db.collection('groups').find({
        teacherId: Number(teacherId),
        _archived: { $ne: true }
      }).toArray();
      const groupIds = new Set(groups.map(g => Number(g.id)));

      // Enrollments
      const allEnr = await db.collection('enrollments').find({ _archived: { $ne: true } }).toArray();
      const groupEnr = allEnr.filter(e => groupIds.has(Number(e.groupId)));
      const enrolledStudentIds = new Set(groupEnr.map(e => Number(e.studentId)));

      // Students
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

      // Attendance
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

      // Grades
      const allGrades = await db.collection('grades').find({ _archived: { $ne: true } }).toArray();
      const gradesMap = {};
      allGrades.forEach(g => {
        if (groupIds.has(Number(g.groupId))) {
          const k = (g.key || `${g.studentId}|${g.date}`);
          gradesMap[k] = g.grade;
        }
      });

      // Homework
      const allHw = await db.collection('homework').find({
        teacherId: Number(teacherId),
        _archived: { $ne: true }
      }).toArray();

      // Announcements
      const allAnn = await db.collection('announcements').find({ _archived: { $ne: true } }).toArray();

      return res.status(200).json({
        ok: true,
        teacher: {
          ...teacherData,
          name: teacherData.fullname,
          title: teacherData.title || "Katta o'qituvchi / Topex Texnikum",
          room: teacherData.room || "3-bino, 302-auditoriya",
          experience: teacherData.experience || "3+ yil",
          telegram: teacherData.telegram || (teacherData.tgChatId ? '@' + teacherData.tgChatId : ''),
          instagram: teacherData.instagram || '',
          hoursPerWeek: teacherData.hoursPerWeek || 24,
          salary: teacherData.salary || 0,
          salaryBreakdown: teacherData.salaryBreakdown || {
            base: teacherData.salary || 5000000,
            kpi: 800000,
            bonus: 400000,
            tax: 600000
          }
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
        homework: allHw,
        announcements: allAnn,
        settings: { soundEnabled: true, compactMode: false, autoSave: true }
      });
    }

    // 5. ATTENDANCE (Davomat)
    if (parts[0] === 'attendance' && req.method === 'POST') {
      const { groupId, date, records } = req.body || {};
      if (!groupId || !date || !records) {
        return res.status(400).json({ error: "groupId, date va records kiritilishi shart" });
      }

      await db.collection('attendance').updateOne(
        { groupId: Number(groupId), date },
        {
          $set: {
            groupId: Number(groupId),
            teacherId: sessionUser.id,
            date,
            records,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            id: Date.now(),
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({ ok: true, savedAt: new Date().toISOString() });
    }

    // 6. GRADES (Baholar)
    if (parts[0] === 'grades' && req.method === 'POST') {
      const { groupId, studentId, date, grade, key, note } = req.body || {};
      if (!groupId || !studentId) {
        return res.status(400).json({ error: "groupId va studentId kiritilishi shart" });
      }

      const k = key || `${studentId}|${date}`;
      await db.collection('grades').updateOne(
        { groupId: Number(groupId), key: k },
        {
          $set: {
            groupId: Number(groupId),
            studentId: Number(studentId),
            teacherId: sessionUser.id,
            date: date || new Date().toISOString().slice(0, 10),
            grade,
            key: k,
            note: note || '',
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            id: Date.now(),
            createdAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({ ok: true });
    }

    // 7. HOMEWORK (Vazifalar)
    if (parts[0] === 'homework' && req.method === 'POST') {
      const body = req.body || {};
      const nid = Date.now();
      await db.collection('homework').insertOne({
        ...body,
        id: nid,
        teacherId: sessionUser.id,
        done: body.done || {},
        createdAt: new Date().toISOString()
      });
      return res.status(201).json({ ok: true, id: nid });
    }

    if (parts[0] === 'homework' && parts[1] === 'toggle' && req.method === 'POST') {
      const { homeworkId, studentId, done } = req.body || {};
      const hw = await db.collection('homework').findOne({ id: Number(homeworkId) });
      if (hw) {
        const d = hw.done || {};
        if (done) d[studentId] = true;
        else delete d[studentId];
        await db.collection('homework').updateOne(
          { id: Number(homeworkId) },
          { $set: { done: d, updatedAt: new Date().toISOString() } }
        );
      }
      return res.status(200).json({ ok: true });
    }

    if (parts[0] === 'homework' && parts[1] && req.method === 'DELETE') {
      await db.collection('homework').deleteOne({ id: Number(parts[1]) });
      return res.status(200).json({ ok: true });
    }

    // 8. STUDENT (O'quvchilar)
    if (parts[0] === 'student' && req.method === 'POST') {
      const body = req.body || {};
      const { name, fullname, phone, groupId, birth, parentName } = body;
      const studentName = fullname || name;
      if (!studentName || !phone) {
        return res.status(400).json({ error: "O'quvchi ismi va telefon raqami kiritilishi shart" });
      }

      const sid = Date.now();
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

      return res.status(201).json({ ok: true, id: sid });
    }

    if (parts[0] === 'student' && parts[1] && req.method === 'PUT') {
      const sid = Number(parts[1]);
      const body = req.body || {};
      await db.collection('students').updateOne(
        { id: sid },
        {
          $set: {
            fullname: body.fullname || body.name,
            phone: body.phone,
            father: body.parentName,
            balance: body.balance !== undefined ? Number(body.balance) : 0,
            updatedAt: new Date().toISOString()
          }
        }
      );
      return res.status(200).json({ ok: true });
    }

    if (parts[0] === 'student' && parts[1] && req.method === 'DELETE') {
      await db.collection('students').updateOne(
        { id: Number(parts[1]) },
        { $set: { _archived: true, archivedAt: new Date().toISOString() } }
      );
      return res.status(200).json({ ok: true });
    }

    // 9. GROUPS (Guruhlar)
    if (parts[0] === 'groups' && req.method === 'POST') {
      const body = req.body || {};
      const gid = Date.now();
      const daysArr = Array.isArray(body.days) ? body.days : [1, 3, 5];
      const daysMap = { 1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba', 7: 'Yakshanba' };
      const daysText = daysArr.map(d => typeof d === 'number' ? (daysMap[d] || 'Dushanba') : d);

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

      return res.status(201).json({ ok: true, id: gid });
    }

    if (parts[0] === 'groups' && parts[1] && req.method === 'PUT') {
      const gid = Number(parts[1]);
      const body = req.body || {};
      await db.collection('groups').updateOne(
        { id: gid },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      );
      return res.status(200).json({ ok: true });
    }

    // 10. PROFILE (Profil yangilash)
    if (parts[0] === 'teacher' && parts[1] === 'profile' && req.method === 'PUT') {
      const body = req.body || {};
      delete body.password;
      delete body.id;
      delete body._id;
      await db.collection('teachers').updateOne(
        { id: sessionUser.id },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      );
      return res.status(200).json({ ok: true });
    }

    // 11. PASSWORD (Parol yangilash)
    if (parts[0] === 'teacher' && parts[1] === 'password' && req.method === 'POST') {
      const { currentPassword, newPassword } = req.body || {};
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" });
      }

      const teacher = await db.collection('teachers').findOne({ id: sessionUser.id });
      if (!teacher || !verify(currentPassword, teacher.password)) {
        return res.status(400).json({ error: "Amaldagi parol noto'g'ri" });
      }

      await db.collection('teachers').updateOne(
        { id: sessionUser.id },
        { $set: { password: hash(newPassword), updatedAt: new Date().toISOString() } }
      );
      return res.status(200).json({ ok: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
    }

    // 12. AI CHAT (Sun'iy Intellekt)
    if (parts[0] === 'ai' && parts[1] === 'chat' && req.method === 'POST') {
      const body = req.body || {};
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

      return res.status(200).json({ ok: true, reply, t: Date.now() });
    }

    // 13. CHATS (Xabarlar)
    if (parts[0] === 'chats' && req.method === 'POST') {
      const body = req.body || {};
      const { chatId, message: msg } = body;
      if (!chatId || !msg) {
        return res.status(400).json({ error: "chatId va message kiritilishi shart" });
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

      await db.collection('chats').insertOne(record);
      return res.status(201).json({ ok: true });
    }

    return res.status(404).json({ error: "Endpoint topilmadi" });

  } catch (err) {
    console.error('API xatosi:', err);
    return res.status(500).json({ error: 'Ichki server xatoligi yuz berdi', details: err.message });
  }
};
