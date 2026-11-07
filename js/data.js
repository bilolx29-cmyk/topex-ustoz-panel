/**
 * TOPEX Texnikum — O'qituvchi Boshqaruv Tizimi
 * Ishchi boshlang'ich ma'lumotlar bazasi
 */
const SEED = (function () {
  const firstNames = [
    "Azizbek", "Dilnoza", "Jasurbek", "Madinabonu", "Sardor", "Nilufar", 
    "Bekzod", "Malika", "Otabek", "Zilola", "Sherzod", "Feruza", 
    "Umidjon", "Gulnora", "Rustam", "Shahlo", "Akmal", "Laylo", 
    "Doniyor", "Kamola", "Islom", "Muslima", "Behruz", "Nodira", 
    "Javlon", "Sevara", "Bobur", "Shaxzoda", "Farrux", "Mohira"
  ];
  
  const lastNames = [
    "Karimov", "Aliyeva", "Tursunov", "Rahimova", "Yusupov", "Ergasheva", 
    "Saidov", "Normatova", "Abdullayev", "Qodirova", "Hasanov", "Ismoilova", 
    "Mirzayev", "Xolmatova", "Ochilov", "Sobirova", "Nazarov", "Botirova", 
    "Qosimov", "Ravshanova", "Anvarov", "Jalilova", "Murodov", "Haydarova", 
    "Ganiyev", "Orifjonova", "Nematov", "Usmonova", "Xoliqov", "Toshmatova"
  ];

  const groups = [
    { 
      id: "g1", 
      name: "FN-24 | Frontend React", 
      course: "Frontend Web Dasturlash (React & Next.js)", 
      room: "3-bino, 304-laboratoriya", 
      days: [1, 3, 5], 
      time: "09:00 - 10:30",
      color: "#6366f1",
      badge: "Faol",
      capacity: 24
    },
    { 
      id: "g2", 
      name: "PY-18 | Python & AI", 
      course: "Python Backend va Sun'iy Intellekt", 
      room: "2-bino, 212-auditoriya", 
      days: [2, 4, 6], 
      time: "11:30 - 13:00",
      color: "#10b981",
      badge: "Faol",
      capacity: 20
    },
    { 
      id: "g3", 
      name: "UI-09 | Grafik & UI/UX", 
      course: "Figma & Zamonaviy UI/UX Dizayn", 
      room: "3-bino, 308-media zal", 
      days: [1, 3, 5], 
      time: "14:30 - 16:00",
      color: "#ec4899",
      badge: "Faol",
      capacity: 18
    },
    { 
      id: "g4", 
      name: "SAT-04 | Advanced Math", 
      course: "SAT Math & Diskret Matematika", 
      room: "1-bino, 105-auditoriya", 
      days: [2, 4, 6], 
      time: "16:30 - 18:00",
      color: "#f59e0b",
      badge: "Faol",
      capacity: 15
    }
  ];

  const groupSizes = { g1: 18, g2: 15, g3: 14, g4: 12 };
  const students = [];
  let studentCounter = 0;

  groups.forEach(g => {
    const count = groupSizes[g.id] || 15;
    for (let i = 0; i < count; i++) {
      studentCounter++;
      const fn = firstNames[(studentCounter * 7 + i * 3) % firstNames.length];
      const ln = lastNames[(studentCounter * 11 + i * 5) % lastNames.length];
      const isIndebted = (studentCounter % 6 === 0);
      const isTopStudent = (studentCounter % 5 === 0);
      
      students.push({
        id: "s" + studentCounter,
        groupId: g.id,
        name: `${fn} ${ln}`,
        phone: "+998 90 " + String(1000000 + studentCounter * 7919).slice(0, 3) + " " + String(1000000 + studentCounter * 7919).slice(3, 5) + " " + String(1000000 + studentCounter * 7919).slice(5, 7),
        parentName: `${lastNames[(studentCounter * 3) % lastNames.length]} aka`,
        parentPhone: "+998 93 " + String(2000000 + studentCounter * 6007).slice(0, 3) + " " + String(2000000 + studentCounter * 6007).slice(3, 5) + " " + String(2000000 + studentCounter * 6007).slice(5, 7),
        birth: (2006 + (studentCounter % 4)) + "-0" + (1 + (studentCounter % 9)) + "-1" + (studentCounter % 9),
        balance: isIndebted ? -(150000 + (studentCounter % 3) * 100000) : 0,
        note: isTopStudent ? "Kafedra olimpiadasi ishtirokchisi, a'lochi" : (isIndebted ? "Oylik to'lov kutilmoqda" : ""),
        status: isIndebted ? "qarzdor" : "faol",
        avatarColor: g.color
      });
    }
  });

  // So'nggi 25 kun uchun haqiqiy davomat xaritasi
  const attendance = {};
  const pad = x => String(x).padStart(2, "0");
  const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const now = new Date();

  for (let back = 0; back <= 25; back++) {
    const d = new Date(now);
    d.setDate(now.getDate() - back);
    const wd = d.getDay() === 0 ? 7 : d.getDay();
    const dateStr = iso(d);

    groups.forEach(g => {
      if (!g.days.includes(wd)) return;
      const rec = {};
      const groupStudents = students.filter(s => s.groupId === g.id);
      groupStudents.forEach((s, idx) => {
        const rand = (idx * 17 + back * 11 + g.id.charCodeAt(1) * 7) % 100;
        // ~88% keldi, ~8% sababli, ~4% kelmadi
        rec[s.id] = rand < 88 ? "keldi" : (rand < 96 ? "sababli" : "kelmadi");
      });
      attendance[g.id + "|" + dateStr] = rec;
    });
  }

  // Baholar jurnali (Grades) - boshlang'ich bo'sh holatda
  const grades = {};

  return {
    teacher: {
      name: "Madina Karimova",
      title: "Katta o'qituvchi / Dasturlash kafedrasi",
      login: "ustoz",
      password: "1234",
      lang: "uz",
      phone: "+998 90 765 43 21",
      email: "madina.karimova@topex.uz",
      gender: "Ayol",
      birth: "1994-06-15",
      region: "Toshkent shahri",
      district: "Yunusobod tumani",
      room: "3-bino, 302-auditoriya",
      hoursPerWeek: 24,
      experience: "7 yil",
      instagram: "@madina_code",
      telegram: "@madina_teacher",
      avatar: "",
      salary: 6500000,
      salaryBreakdown: {
        base: 5200000,
        kpi: 800000,
        bonus: 500000,
        tax: 650000
      }
    },
    settings: {
      soundEnabled: true,
      compactMode: false,
      autoSave: true
    },
    groups,
    students,
    attendance,
    grades,
    homework: [
      {
        id: "h1",
        groupId: "g1",
        title: "React Todo App & LocalStorage",
        desc: "React hooks (useState, useEffect) yordamida Todo ilovasi yarating. Ma'lumotlar localStorage da saqlanishi kerak.",
        due: iso(new Date(now.getTime() + 2 * 864e5)),
        maxScore: 100,
        done: { s1: true, s2: true, s3: true, s5: true, s6: true, s8: true, s10: true, s12: true }
      },
      {
        id: "h2",
        groupId: "g2",
        title: "FastAPI CRUD & SQLite",
        desc: "O'quvchilar ro'yxati uchun REST API yarating: GET, POST, PUT, DELETE endpointlari va Pydantic modellar bo'lsin.",
        due: iso(new Date(now.getTime() + 3 * 864e5)),
        maxScore: 100,
        done: { s19: true, s20: true, s22: true, s24: true }
      },
      {
        id: "h3",
        groupId: "g3",
        title: "Mobil ilova uchun E-commerce UI Kit",
        desc: "Figma dasturida 4 ta asosiy ekran: Splash, Katalog, Mahsulot kartasi va Savatcha ekranlarini chizing.",
        due: iso(new Date(now.getTime() + 4 * 864e5)),
        maxScore: 100,
        done: { s34: true, s35: true, s37: true }
      },
      {
        id: "h4",
        groupId: "g4",
        title: "SAT Practice Test 4 — Math Module 1 & 2",
        desc: "Bluebook ilovasida 4-testni to'liq ishlab, natija skrinshotini va xatolar tahlilini daftarga yozing.",
        due: iso(new Date(now.getTime() - 1 * 864e5)), // Muddati tugagan
        maxScore: 100,
        done: { s48: true, s49: true, s50: true, s51: true, s53: true }
      }
    ],
    announcements: [
      {
        id: "a1",
        title: "Kuzgi semestr oraliq nazorati (Midterm Exam) jadvali",
        content: "Barcha guruhlar uchun oraliq nazorat imtihonlari 10-noyabrdan 15-noyabrgacha bo'lib o'tadi. Jurnallarni to'ldirish va qarzdor o'quvchilarni ogohlantirish so'raladi.",
        date: "2026-10-28",
        author: "O'quv bo'limi",
        badge: "Muhim",
        badgeType: "bad"
      },
      {
        id: "a2",
        title: "Topex Texnikum 'Tech Hackathon 2026' tanlovi",
        content: "Texnikum talabalari o'rtasida 48 soatlik dasturlash va dizayn xakatoni o'tkaziladi. O'quvchilarni jamoalarga birlashishga undashingizni so'raymiz.",
        date: "2026-10-25",
        author: "Kafedra mudiri",
        badge: "Tadbir",
        badgeType: "ok"
      },
      {
        id: "a3",
        title: "Ochiq dars va metodik seminar",
        content: "Chorshanba kuni soat 14:00 da 304-laboratoriyada 'Interaktiv ta'limda zamonaviy metodlar' mavzusida ochiq dars bo'lib o'tadi.",
        date: "2026-10-20",
        author: "Metodika bo'limi",
        badge: "E'lon",
        badgeType: "primary"
      }
    ],
    chats: {
      g1: [
        { from: "them", sender: "Azizbek Karimov", text: "Assalomu alaykum ustoz! Bugungi React Hooks vazifasidagi 3-topshiriq bo'yicha savolim bor edi.", t: Date.now() - 3600000 * 5 },
        { from: "me", sender: "Madina Karimova", text: "Vaalaykum assalom Azizbek! Qaysi qismida qiyinchilik bo'ldi? useEffect qaramliklar massividami?", t: Date.now() - 3600000 * 4 },
        { from: "them", sender: "Azizbek Karimov", text: "Ha, cheksiz render bo'lib qolyapti. Qaramlikni to'g'ri berdim deb o'ylagandim.", t: Date.now() - 3600000 * 3 },
        { from: "me", sender: "Madina Karimova", text: "Funksiyani useEffect ichida chaqirish kerak yoki useCallback ishlatish lozim. Ertaga dars boshida birgalikda ko'ramiz!", t: Date.now() - 3600000 * 2 },
        { from: "them", sender: "Dilnoza Aliyeva", text: "Ustoz, ertaga dars 09:00 da 304-xonadami?", t: Date.now() - 3600000 * 1 },
        { from: "me", sender: "Madina Karimova", text: "Ha, albatta, dars o'z vaqtida 304-auditoriyada boshlanadi. Hammaga omad!", t: Date.now() - 1800000 }
      ],
      g2: [
        { from: "them", sender: "Sardor Yusupov", text: "Ustoz, FastAPI loyihasini GitHub ga yuklab linkini jo'natdim.", t: Date.now() - 7200000 },
        { from: "me", sender: "Madina Karimova", text: "Ko'rdim Sardor, juda yaxshi tuzilgan! Faqat requirements.txt ni ham qo'shib qo'ying.", t: Date.now() - 3600000 }
      ],
      g3: [
        { from: "them", sender: "Malika Normatova", text: "Assalomu alaykum ustoz! Figma darsliklari slaydlarini yubora olasizmi?", t: Date.now() - 86400000 },
        { from: "me", sender: "Madina Karimova", text: "Vaalaykum assalom! Slaydlar va komponentlar kutubxonasi umumiy papkaga joylandi.", t: Date.now() - 43200000 }
      ],
      g4: [
        { from: "them", sender: "Otabek Saidov", text: "Ustoz, bugungi SAT test natijalarini qachon bilamiz?", t: Date.now() - 5400000 },
        { from: "me", sender: "Madina Karimova", text: "Hozir tekshiryapman, kechki soat 19:00 gacha jurnallarga ballar kiritiladi.", t: Date.now() - 2700000 }
      ]
    },
    notifications: {
      homework: true,
      attendance: true,
      payments: true,
      chat: true,
      announcements: true
    },
    payments: [
      { date: "2026-10-05", desc: "Oylik maosh (Sentabr oyi to'liq stavka)", amount: 6500000, status: "To'landi", type: "Oylik" },
      { date: "2026-09-05", desc: "Oylik maosh (Avgust oyi)", amount: 6200000, status: "To'landi", type: "Oylik" },
      { date: "2026-08-05", desc: "Oylik maosh (Iyul oyi)", amount: 5800000, status: "To'landi", type: "Oylik" },
      { date: "2026-07-05", desc: "Oylik maosh va mehnat ta'tili to'lovi", amount: 9400000, status: "To'landi", type: "Ta'til puli" }
    ]
  };
})();
