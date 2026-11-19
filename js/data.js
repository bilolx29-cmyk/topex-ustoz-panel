/**
 * TOPEX Texnikum — O'qituvchi Boshqaruv Tizimi
 * Standart boshlang'ich ma'lumotlar bazasi
 */
const SEED = (function () {
  return {
    teacher: {
      id: "t_1",
      name: "Azamat Qodirov",
      fullname: "Azamat Qodirov",
      phone: "+998 90 765 43 21",
      title: "Katta o'qituvchi / Dasturlash kafedrasi",
      room: "3-bino, 302-auditoriya",
      salary: 6500000,
      salaryBreakdown: { base: 5200000, kpi: 800000, bonus: 500000, tax: 650000 }
    },
    settings: {
      soundEnabled: true,
      compactMode: false,
      autoSave: true
    },
    groups: [],
    students: [],
    attendance: {},
    grades: {},
    homework: [],
    announcements: [],
    chats: {
      "ai": [
        {
          from: "ai",
          sender: "Topex AI",
          text: "Assalomu alaykum, hurmatli ustoz! Men TOPEX Texnikum Sun'iy Intellekt (AI) yordamchisiman. Dars rejalari, metodika, dasturlash kodlari, test savollari yoki uy vazifalari bo'yicha qanday yordam bera olaman?",
          t: Date.now() - 60000
        }
      ]
    },
    notifications: {
      homework: true,
      attendance: true,
      payments: true,
      chat: true,
      announcements: true
    },
    payments: []
  };
})();
