/**
 * TOPEX Texnikum — Ma'lumotlar Saqlash va Sinxronizatsiya Qatlami (Store)
 * TOPEX CRM bilan real vaqtda server orqali ishlaydi
 */
const KEY = "topex_ustoz_panel_v3";

const Store = {
  state: null,
  isSyncing: false,
  lastSyncError: null,

  load() {
    try {
      // 1. Agar avtorizatsiyadan o'tmagan bo'lsa
      if (!API.isLoggedIn()) {
        this.state = {
          session: { in: false, theme: localStorage.getItem("topex_theme") || "light" },
          teacher: null,
          groups: [],
          students: [],
          attendance: {},
          grades: {},
          homework: [],
          announcements: [],
          chats: {},
          settings: { soundEnabled: true, compactMode: false, autoSave: true }
        };
        return this.state;
      }

      // 2. Tizimga kirilgan: keshdan ma'lumotlarni olamiz
      let cached = API.getCachedData();
      if (!cached) {
        let raw = localStorage.getItem(KEY);
        if (raw) {
          try { cached = JSON.parse(raw); } catch (e) {}
        }
      }

      const activeUser = API.getUser() || {};

      if (cached && cached.teacher) {
        this.state = cached;
      } else {
        // Boshlang'ich holat
        this.state = {
          teacher: {
            id: activeUser.id,
            name: activeUser.fullname || "Ustoz",
            fullname: activeUser.fullname || "Ustoz",
            phone: activeUser.phone || "",
            title: "O'qituvchi / Topex Texnikum",
            room: "3-bino, 302-auditoriya",
            salary: 0,
            salaryBreakdown: { base: 0, kpi: 0, bonus: 0, tax: 0 }
          },
          groups: [],
          students: [],
          attendance: {},
          grades: {},
          homework: [],
          announcements: [],
          chats: {},
          settings: { soundEnabled: true, compactMode: false, autoSave: true }
        };
      }

      // Chatlarni tiklash (LocalStorage)
      let savedChats = null;
      try {
        const rawChats = localStorage.getItem("topex_chats_store");
        if (rawChats) savedChats = JSON.parse(rawChats);
      } catch (e) {}

      this.state.chats = (cached && cached.chats) || savedChats || this.state.chats || {};

      // Standart AI suhbatini tekshirish
      if (!this.state.chats["ai"] || !this.state.chats["ai"].length) {
        this.state.chats["ai"] = [
          {
            from: "ai",
            sender: "Topex AI",
            text: "Assalomu alaykum, hurmatli ustoz! Men TOPEX Texnikum Sun'iy Intellekt (AI) yordamchisiman. Dars rejalari, metodika, dasturlash kodlari, test savollari yoki uy vazifalari bo'yicha qanday yordam bera olaman?",
            t: Date.now() - 60000
          }
        ];
      }

      // Sessiyani sozlash
      this.state.session = {
        in: true,
        theme: localStorage.getItem("topex_theme") || (this.state.session && this.state.session.theme) || "light",
        user: activeUser
      };

    } catch (e) {
      console.error("Store load xatoligi:", e);
      this.state = {
        session: { in: API.isLoggedIn(), theme: "light" },
        teacher: {},
        groups: [],
        students: [],
        attendance: {},
        grades: {},
        homework: [],
        announcements: [],
        settings: { soundEnabled: true }
      };
    }

    return this.state;
  },

  // Serverdan real ma'lumotlarni yuklash (Server Sync)
  async syncFromServer() {
    if (!API.isLoggedIn()) return null;
    this.isSyncing = true;
    this.lastSyncError = null;

    try {
      // Sessiya haqiqiyligini tekshirish
      const meRes = await API.getMe();
      if (!meRes || !meRes.ok) {
        if (!this.state.session) this.state.session = {};
        this.state.session.in = false;
        API.clearSession();
        return null;
      }

      if (!this.state.session) this.state.session = {};
      this.state.session.in = true;
      this.state.session.user = meRes.user || API.getUser();

      // Ustozning barcha real ma'lumotlarini bazadan olish
      const data = await API.getTeacherData();
      if (data && data.ok) {
        const prevChats = this.state.chats;
        this.state.teacher = data.teacher || this.state.teacher;
        this.state.groups = data.groups || [];
        this.state.students = data.students || [];
        this.state.attendance = data.attendance || {};
        this.state.grades = data.grades || {};
        this.state.homework = data.homework || [];
        this.state.chats = (data.chats && Object.keys(data.chats).length) ? { ...prevChats, ...data.chats } : (prevChats || this.state.chats || {});
        if (!this.state.chats["ai"]) {
          this.state.chats["ai"] = [
            {
              from: "ai",
              sender: "Topex AI",
              text: "Assalomu alaykum, hurmatli ustoz! Men TOPEX Texnikum Sun'iy Intellekt (AI) yordamchisiman. Dars rejalari, metodika, dasturlash kodlari, test savollari yoki uy vazifalari bo'yicha qanday yordam bera olaman?",
              t: Date.now() - 60000
            }
          ];
        }
        if (data.announcements && data.announcements.length > 0) {
          this.state.announcements = data.announcements;
        }
        if (data.settings) {
          this.state.settings = { ...this.state.settings, ...data.settings };
        }

        this.save();
      }
      return this.state;
    } catch (err) {
      console.warn("Server bilan sinxronlashda xatolik:", err.message);
      this.lastSyncError = err.message;
      if (err.status === 401 || err.status === 403) {
        this.state.session.in = false;
        API.clearSession();
      }
      return this.state;
    } finally {
      this.isSyncing = false;
    }
  },

  // Lokal saqlash (Offline cache)
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
      if (this.state.chats) {
        localStorage.setItem("topex_chats_store", JSON.stringify(this.state.chats));
      }
      if (this.state.session && this.state.session.theme) {
        localStorage.setItem("topex_theme", this.state.session.theme);
      }
    } catch (e) {
      console.error("Store save error:", e);
    }
  },

  // Davomatni saqlash (Server + Local)
  async recordAttendance(groupId, date, records) {
    const key = groupId + "|" + date;
    if (!this.state.attendance) this.state.attendance = {};
    this.state.attendance[key] = { ...(this.state.attendance[key] || {}), ...records };
    this.save();

    try {
      await API.saveAttendance(groupId, date, records);
    } catch (err) {
      console.error("Davomatni serverga saqlashda xatolik:", err);
      throw err;
    }
  },

  // Bahoni saqlash (Server + Local)
  async recordGrade(groupId, studentId, date, grade, key, note) {
    const k = key || `${studentId}|${date}`;
    if (!this.state.grades) this.state.grades = {};
    this.state.grades[k] = grade;
    this.save();

    try {
      await API.saveGrade(groupId, studentId, date, grade, k, note);
    } catch (err) {
      console.error("Bahoni serverga saqlashda xatolik:", err);
      throw err;
    }
  },

  // Vazifa yaratish (Server + Local)
  async createHomework(hwData) {
    hwData.id = hwData.id || this.uid("h");
    hwData.done = hwData.done || {};
    this.state.homework.unshift(hwData);
    this.save();

    try {
      const res = await API.addHomework(hwData);
      if (res && res.id) hwData.id = res.id;
      this.save();
    } catch (err) {
      console.error("Vazifani serverga saqlashda xatolik:", err);
      throw err;
    }
  },

  // Vazifa topshirilganligini belgilash
  async setHomeworkDone(hwId, studentId, done) {
    const hw = this.state.homework.find(h => String(h.id) === String(hwId));
    if (hw) {
      hw.done = hw.done || {};
      if (done) hw.done[studentId] = true;
      else delete hw.done[studentId];
      this.save();
    }

    try {
      await API.toggleHomework(hwId, studentId, done);
    } catch (err) {
      console.error("Vazifa holatini serverga yuborishda xatolik:", err);
    }
  },

  // Vazifani o'chirish
  async deleteHomework(hwId) {
    this.state.homework = this.state.homework.filter(h => String(h.id) !== String(hwId));
    this.save();

    try {
      await API.deleteHomework(hwId);
    } catch (err) {
      console.error("Vazifani serverdan o'chirishda xatolik:", err);
    }
  },

  // Yangi o'quvchi qo'shish
  async createStudent(studentData) {
    studentData.id = studentData.id || this.uid("s");
    this.state.students.push(studentData);
    this.save();

    try {
      const res = await API.addStudent(studentData);
      if (res && res.id) studentData.id = res.id;
      this.save();
    } catch (err) {
      console.error("O'quvchini serverga saqlashda xatolik:", err);
      throw err;
    }
  },

  // O'quvchini yangilash
  async updateStudent(studentId, studentData) {
    const idx = this.state.students.findIndex(s => String(s.id) === String(studentId));
    if (idx !== -1) {
      this.state.students[idx] = { ...this.state.students[idx], ...studentData };
      this.save();
    }

    try {
      await API.updateStudent(studentId, studentData);
    } catch (err) {
      console.error("O'quvchini yangilashda xatolik:", err);
      throw err;
    }
  },

  // O'quvchini o'chirish
  async deleteStudent(studentId) {
    this.state.students = this.state.students.filter(s => String(s.id) !== String(studentId));
    this.save();

    try {
      await API.deleteStudent(studentId);
    } catch (err) {
      console.error("O'quvchini serverdan o'chirishda xatolik:", err);
    }
  },

  // Yangi guruh qo'shish
  async createGroup(groupData) {
    groupData.id = groupData.id || this.uid("g");
    this.state.groups.push(groupData);
    this.save();

    try {
      const res = await API.addGroup(groupData);
      if (res && res.id) groupData.id = res.id;
      this.save();
    } catch (err) {
      console.error("Guruhni serverga saqlashda xatolik:", err);
      throw err;
    }
  },

  // Guruhni yangilash
  async updateGroup(groupId, groupData) {
    const idx = this.state.groups.findIndex(g => String(g.id) === String(groupId));
    if (idx !== -1) {
      this.state.groups[idx] = { ...this.state.groups[idx], ...groupData };
      this.save();
    }

    try {
      await API.updateGroup(groupId, groupData);
    } catch (err) {
      console.error("Guruhni serverda yangilashda xatolik:", err);
      throw err;
    }
  },

  // Profilni yangilash
  async saveProfile(profileData) {
    Object.assign(this.state.teacher, profileData);
    this.save();

    try {
      await API.updateProfile(profileData);
    } catch (err) {
      console.error("Profilni serverga saqlashda xatolik:", err);
      throw err;
    }
  },

  // Chiqish (Logout)
  async logout() {
    try {
      await API.logout();
    } catch (e) {}
    this.state.session.in = false;
    this.state.teacher = null;
    this.save();
  },

  uid(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
  }
};
