/**
 * ==========================================================================
 * TOPEX Tizimi — Yagona Umumiy Baza va Boshqaruv Qatlami (Shared DB Engine)
 * Developer <-> Direktor <-> Ustoz panellarini yagona tizimga birlashtiradi
 * ==========================================================================
 */

const TOPEX_STORAGE_KEYS = {
  DEVELOPERS: "topex_db_developers",
  DIRECTORS: "topex_db_directors",
  TEACHERS: "topex_db_teachers",
  STUDENTS: "topex_db_students",
  GROUPS: "topex_db_groups",
  ATTENDANCE: "topex_db_attendance",
  GRADES: "topex_db_grades",
  HOMEWORK: "topex_db_homework",
  LOGS: "topex_db_audit_logs",
  SETTINGS: "topex_db_system_settings",
  CURRENT_DIRECTOR: "topex_director_session",
  CURRENT_DEVELOPER: "topex_developer_session",
  CURRENT_TEACHER: "topex_teacher_user"
};

const TopexDB = {
  isLocalDevelopment() {
    const hostname = typeof location === "undefined" ? "" : location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  },

  // Telefon raqamidan faqat raqamlarni ajratib olish
  cleanPhone(p) {
    if (!p) return "";
    return String(p).replace(/\D/g, "");
  },

  // Chiroyli O'zbekiston telefon formati: +998 90 123 45 67 (o'zi joy tashlab boradi)
  formatPhone(input) {
    if (!input) return "";
    let str = String(input);
    let digits = str.replace(/\D/g, "");

    // Agar 998 bilan boshlansa
    if (digits.startsWith("998")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("8") && digits.length > 9) {
      digits = digits.slice(1);
    }

    // Maksimal 9 ta raqam (XX XXX XX XX)
    digits = digits.slice(0, 9);

    let res = "+998";
    if (digits.length > 0) {
      res += " " + digits.slice(0, 2);
    }
    if (digits.length > 2) {
      res += " " + digits.slice(2, 5);
    }
    if (digits.length > 5) {
      res += " " + digits.slice(5, 7);
    }
    if (digits.length > 7) {
      res += " " + digits.slice(7, 9);
    }
    return res;
  },

  // Telefon inputiga faqat raqamlarni kiritish va avto-formatlash bind qilish
  bindPhoneInput(inputElement) {
    if (!inputElement || inputElement._hasPhoneMask) return;
    inputElement._hasPhoneMask = true;

    inputElement.setAttribute("type", "tel");
    inputElement.setAttribute("inputmode", "numeric");
    inputElement.setAttribute("autocomplete", "tel");
    inputElement.setAttribute("placeholder", "+998 90 123 45 67");
    inputElement.setAttribute("maxlength", "17");

    // Klaviatura orqali harf kiritilishini oldini olish
    inputElement.addEventListener("keydown", (e) => {
      // Navigation va boshqaruv klavishlariga ruxsat
      if (["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab", "Enter", "Home", "End"].includes(e.key) ||
          (e.ctrlKey || e.metaKey)) {
        // Backspace da bo'sh joyni qulay o'chirish
        if (e.key === "Backspace") {
          const val = inputElement.value;
          const pos = inputElement.selectionStart;
          if (pos === inputElement.selectionEnd && pos > 0) {
            if (val[pos - 1] === " ") {
              e.preventDefault();
              const newVal = val.slice(0, pos - 2) + val.slice(pos);
              inputElement.value = TopexDB.formatPhone(newVal);
              const nextPos = Math.max(5, pos - 2);
              inputElement.setSelectionRange(nextPos, nextPos);
              return;
            } else if (pos <= 5) {
              e.preventDefault();
              return;
            }
          }
        }
        return;
      }

      // Faqat 0-9 raqamlari qabul qilinadi
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    inputElement.addEventListener("input", (e) => {
      const raw = inputElement.value;
      const digitsOnly = raw.replace(/\D/g, "");
      
      if (!digitsOnly || (digitsOnly === "998" && raw.trim().length <= 4)) {
        inputElement.value = "+998 ";
        return;
      }

      const formatted = TopexDB.formatPhone(raw);
      inputElement.value = formatted;
    });

    inputElement.addEventListener("focus", (e) => {
      if (!inputElement.value || inputElement.value.trim() === "" || inputElement.value === "+998") {
        inputElement.value = "+998 ";
      }
    });

    inputElement.addEventListener("blur", (e) => {
      if (inputElement.value === "+998 " || inputElement.value === "+998") {
        inputElement.value = "";
      }
    });
  },

  // Boshlang'ich tizim holatini tayyorlash
  init() {
    const allowDemoAccounts = this.isLocalDevelopment();

    // 1. Developers
    if (allowDemoAccounts && !localStorage.getItem(TOPEX_STORAGE_KEYS.DEVELOPERS)) {
      const initialDevs = [
        {
          id: "dev_1",
          name: "Developer Boshqaruvchi",
          phone: "+998 (99) 999-99-99",
          login: "dev",
          password: "dev123",
          role: "developer",
          title: "Bosh Tizim Dasturchisi / Super Admin",
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(TOPEX_STORAGE_KEYS.DEVELOPERS, JSON.stringify(initialDevs));
    }

    // 2. Directors
    if (allowDemoAccounts && !localStorage.getItem(TOPEX_STORAGE_KEYS.DIRECTORS)) {
      const initialDirectors = [
        {
          id: "dir_1",
          name: "Jasur Rahimov",
          phone: "+998 (90) 123-45-67",
          password: "admin123",
          title: "Bosh direktor",
          role: "director",
          permissions: {
            manageTeachers: true,
            manageStudents: true,
            manageGroups: true,
            viewFinances: true
          },
          active: true,
          lastLogin: null,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(TOPEX_STORAGE_KEYS.DIRECTORS, JSON.stringify(initialDirectors));
    }

    // 3. Teachers (Boshlang'ich 1 ta test ustozi)
    if (allowDemoAccounts && !localStorage.getItem(TOPEX_STORAGE_KEYS.TEACHERS)) {
      const initialTeachers = [
        {
          id: "t_1",
          name: "Azamat Qodirov",
          fullname: "Azamat Qodirov",
          phone: "+998 (90) 765-43-21",
          password: "1234",
          title: "Katta o'qituvchi / Dasturlash kafedrasi",
          room: "3-bino, 302-auditoriya",
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(TOPEX_STORAGE_KEYS.TEACHERS, JSON.stringify(initialTeachers));
    }

    // 4. Groups
    if (!localStorage.getItem(TOPEX_STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(TOPEX_STORAGE_KEYS.GROUPS, JSON.stringify([]));
    }

    // 5. Students
    if (!localStorage.getItem(TOPEX_STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(TOPEX_STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    }

    // 6. Logs
    if (!localStorage.getItem(TOPEX_STORAGE_KEYS.LOGS)) {
      const initialLogs = [
        {
          id: "log_" + Date.now(),
          timestamp: new Date().toISOString(),
          actor: "Tizim",
          role: "system",
          action: "Tizim muvaffaqiyatli ishga tushirildi",
          details: "Developer, Direktor va Ustoz modullari tayyor holatga keltirildi"
        }
      ];
      localStorage.setItem(TOPEX_STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
    }

    // 7. Settings
    if (!localStorage.getItem(TOPEX_STORAGE_KEYS.SETTINGS)) {
      const defaultSettings = {
        systemName: "TOPEX Boshqaruv Ekotizimi",
        maintenanceMode: false,
        allowRegistration: true,
        aiEnabled: true,
        theme: "light"
      };
      localStorage.setItem(TOPEX_STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
  },

  // Audit Log qayd qilish
  log(actor, role, action, details = "") {
    try {
      const logs = this.getLogs();
      logs.unshift({
        id: "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        actor,
        role,
        action,
        details
      });
      // Oxirgi 200 ta logni saqlash
      if (logs.length > 200) logs.pop();
      localStorage.setItem(TOPEX_STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {}
  },

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.LOGS) || "[]");
    } catch (e) {
      return [];
    }
  },

  clearLogs() {
    localStorage.setItem(TOPEX_STORAGE_KEYS.LOGS, JSON.stringify([]));
    this.log("Developer", "developer", "Tizim loglari tozalandi");
  },

  // --- DEVELOPERS ---
  getDevelopers() {
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.DEVELOPERS) || "[]");
    } catch (e) {
      return [];
    }
  },

  loginDeveloper(phoneOrLogin, password) {
    if (!this.isLocalDevelopment()) {
      throw new Error("Mahalliy demo hisoblari faqat development muhitida ishlaydi.");
    }
    const devs = this.getDevelopers();
    const cleanInp = this.cleanPhone(phoneOrLogin);
    const rawInp = String(phoneOrLogin || "").trim().toLowerCase();

    const dev = devs.find(d => {
      const dClean = this.cleanPhone(d.phone);
      const matchPhone = cleanInp && (dClean === cleanInp || dClean.endsWith(cleanInp) || cleanInp.endsWith(dClean));
      const matchLogin = d.login && d.login.toLowerCase() === rawInp;
      return (matchPhone || matchLogin) && String(d.password) === String(password);
    });

    if (dev) {
      if (dev.active === false) {
        throw new Error("Hisobingiz bloklangan. Tizim administratori bilan bog'laning.");
      }
      dev.lastLogin = new Date().toISOString();
      this.saveDeveloper(dev);
      localStorage.setItem(TOPEX_STORAGE_KEYS.CURRENT_DEVELOPER, JSON.stringify(dev));
      this.log(dev.name, "developer", "Developer tizimga kirdi");
      return dev;
    }
    throw new Error("Developer login/telefon yoki parol noto'g'ri!");
  },

  saveDeveloper(dev) {
    const devs = this.getDevelopers();
    const idx = devs.findIndex(d => d.id === dev.id);
    if (idx >= 0) {
      devs[idx] = { ...devs[idx], ...dev };
    } else {
      dev.id = dev.id || "dev_" + Date.now();
      dev.createdAt = dev.createdAt || new Date().toISOString();
      devs.push(dev);
    }
    localStorage.setItem(TOPEX_STORAGE_KEYS.DEVELOPERS, JSON.stringify(devs));
  },

  getCurrentDeveloper() {
    if (!this.isLocalDevelopment()) return null;
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.CURRENT_DEVELOPER) || "null");
    } catch (e) {
      return null;
    }
  },

  logoutDeveloper() {
    const dev = this.getCurrentDeveloper();
    if (dev) this.log(dev.name, "developer", "Developer tizimdan chiqdi");
    localStorage.removeItem(TOPEX_STORAGE_KEYS.CURRENT_DEVELOPER);
  },

  // --- DIRECTORS ---
  getDirectors() {
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.DIRECTORS) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveDirector(dir) {
    const dirs = this.getDirectors();
    const idx = dirs.findIndex(d => d.id === dir.id);
    if (idx >= 0) {
      dirs[idx] = { ...dirs[idx], ...dir };
      this.log("Developer", "developer", "Direktor ma'lumotlari yangilandi", dir.name);
    } else {
      dir.id = dir.id || "dir_" + Date.now();
      dir.createdAt = dir.createdAt || new Date().toISOString();
      dir.active = dir.active !== undefined ? dir.active : true;
      dirs.push(dir);
      this.log("Developer", "developer", "Yangi direktor tayinlandi", dir.name);
    }
    localStorage.setItem(TOPEX_STORAGE_KEYS.DIRECTORS, JSON.stringify(dirs));
  },

  deleteDirector(id) {
    let dirs = this.getDirectors();
    const target = dirs.find(d => d.id === id);
    dirs = dirs.filter(d => d.id !== id);
    localStorage.setItem(TOPEX_STORAGE_KEYS.DIRECTORS, JSON.stringify(dirs));
    if (target) {
      this.log("Developer", "developer", "Direktor o'chirildi", target.name);
    }
  },

  loginDirector(phone, password) {
    if (!this.isLocalDevelopment()) {
      throw new Error("Mahalliy demo hisoblari faqat development muhitida ishlaydi.");
    }
    const dirs = this.getDirectors();
    const cleanInp = this.cleanPhone(phone);

    const dir = dirs.find(d => {
      const dClean = this.cleanPhone(d.phone);
      const matchPhone = cleanInp && (dClean === cleanInp || dClean.endsWith(cleanInp) || cleanInp.endsWith(dClean));
      return matchPhone && String(d.password) === String(password);
    });

    if (dir) {
      if (dir.active === false) {
        throw new Error("Direktor hisobi vaqtincha bloklangan. Bosh dasturchiga murojaat qiling.");
      }
      dir.lastLogin = new Date().toISOString();
      this.saveDirector(dir);
      localStorage.setItem(TOPEX_STORAGE_KEYS.CURRENT_DIRECTOR, JSON.stringify(dir));
      this.log(dir.name, "director", "Direktor tizimga kirdi");
      return dir;
    }
    throw new Error("Telefon raqam yoki parol noto'g'ri!");
  },

  getCurrentDirector() {
    if (!this.isLocalDevelopment()) return null;
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.CURRENT_DIRECTOR) || "null");
    } catch (e) {
      return null;
    }
  },

  logoutDirector() {
    const dir = this.getCurrentDirector();
    if (dir) this.log(dir.name, "director", "Direktor tizimdan chiqdi");
    localStorage.removeItem(TOPEX_STORAGE_KEYS.CURRENT_DIRECTOR);
  },

  // --- TEACHERS ---
  getTeachers() {
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.TEACHERS) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveTeacher(t) {
    const teachers = this.getTeachers();
    const idx = teachers.findIndex(item => item.id === t.id);
    if (idx >= 0) {
      teachers[idx] = { ...teachers[idx], ...t };
      this.log("Direktor", "director", "O'qituvchi yangilandi", t.name || t.fullname);
    } else {
      t.id = t.id || "t_" + Date.now();
      t.createdAt = t.createdAt || new Date().toISOString();
      t.active = t.active !== undefined ? t.active : true;
      teachers.push(t);
      this.log("Direktor", "director", "Yangi o'qituvchi ro'yxatga olindi", t.name || t.fullname);
    }
    localStorage.setItem(TOPEX_STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));

    // Agar hozir keshda saqlangan ustoz shu bo'lsa yangilaymiz
    try {
      const activeUser = JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.CURRENT_TEACHER) || "null");
      if (activeUser && activeUser.id === t.id) {
        localStorage.setItem(TOPEX_STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify({ ...activeUser, ...t }));
      }
    } catch (e) {}
  },

  deleteTeacher(id) {
    let teachers = this.getTeachers();
    const target = teachers.find(t => t.id === id);
    teachers = teachers.filter(t => t.id !== id);
    localStorage.setItem(TOPEX_STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    if (target) {
      this.log("Direktor", "director", "O'qituvchi hisobi o'chirildi", target.name || target.fullname);
    }
  },

  // Ustoz telefon raqami va paroli bilan kirish tekshiruvi
  loginTeacher(phone, password) {
    if (!this.isLocalDevelopment()) {
      throw new Error("Mahalliy demo hisoblari faqat development muhitida ishlaydi.");
    }
    const teachers = this.getTeachers();
    const cleanInp = this.cleanPhone(phone);

    const teacher = teachers.find(t => {
      const tClean = this.cleanPhone(t.phone);
      const matchPhone = cleanInp && (tClean === cleanInp || tClean.endsWith(cleanInp) || cleanInp.endsWith(tClean));
      return matchPhone && String(t.password) === String(password);
    });

    if (teacher) {
      if (teacher.active === false) {
        throw new Error("O'qituvchi hisobi nofaol holatda. Direktorga murojaat qiling.");
      }
      teacher.lastLogin = new Date().toISOString();
      this.saveTeacher(teacher);
      this.log(teacher.name || teacher.fullname, "teacher", "Ustoz tizimga kirdi");
      return teacher;
    }
    throw new Error("Telefon raqam yoki parol noto'g'ri. Direktor hisobingizni ochganligiga ishonch hosil qiling.");
  },

  // --- GROUPS ---
  getGroups() {
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.GROUPS) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveGroup(g) {
    const groups = this.getGroups();
    const idx = groups.findIndex(item => item.id === g.id);
    if (idx >= 0) {
      groups[idx] = { ...groups[idx], ...g };
      this.log("Direktor", "director", "Guruh yangilandi", g.name);
    } else {
      g.id = g.id || "g_" + Date.now();
      g.createdAt = g.createdAt || new Date().toISOString();
      groups.push(g);
      this.log("Direktor", "director", "Yangi guruh ochildi", g.name);
    }
    localStorage.setItem(TOPEX_STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  deleteGroup(id) {
    let groups = this.getGroups();
    const target = groups.find(g => g.id === id);
    groups = groups.filter(g => g.id !== id);
    localStorage.setItem(TOPEX_STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    if (target) {
      this.log("Direktor", "director", "Guruh o'chirildi", target.name);
    }
  },

  // --- STUDENTS ---
  getStudents() {
    try {
      return JSON.parse(localStorage.getItem(TOPEX_STORAGE_KEYS.STUDENTS) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveStudent(s) {
    const students = this.getStudents();
    const idx = students.findIndex(item => item.id === s.id);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...s };
      this.log("Direktor", "director", "O'quvchi ma'lumotlari yangilandi", s.name || s.fullname);
    } else {
      s.id = s.id || "s_" + Date.now();
      s.createdAt = s.createdAt || new Date().toISOString();
      students.push(s);
      this.log("Direktor", "director", "Yangi o'quvchi qo'shildi", s.name || s.fullname);
    }
    localStorage.setItem(TOPEX_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  deleteStudent(id) {
    let students = this.getStudents();
    const target = students.find(s => s.id === id);
    students = students.filter(s => s.id !== id);
    localStorage.setItem(TOPEX_STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    if (target) {
      this.log("Direktor", "director", "O'quvchi o'chirildi", target.name || target.fullname);
    }
  },

  // --- ZAXIRA VA TOZALASH ---
  exportAll() {
    const dump = {
      version: "TOPEX-1.0",
      exportedAt: new Date().toISOString(),
      developers: this.getDevelopers(),
      directors: this.getDirectors(),
      teachers: this.getTeachers(),
      groups: this.getGroups(),
      students: this.getStudents(),
      logs: this.getLogs()
    };
    return JSON.stringify(dump, null, 2);
  },

  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.developers) localStorage.setItem(TOPEX_STORAGE_KEYS.DEVELOPERS, JSON.stringify(data.developers));
      if (data.directors) localStorage.setItem(TOPEX_STORAGE_KEYS.DIRECTORS, JSON.stringify(data.directors));
      if (data.teachers) localStorage.setItem(TOPEX_STORAGE_KEYS.TEACHERS, JSON.stringify(data.teachers));
      if (data.groups) localStorage.setItem(TOPEX_STORAGE_KEYS.GROUPS, JSON.stringify(data.groups));
      if (data.students) localStorage.setItem(TOPEX_STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
      if (data.logs) localStorage.setItem(TOPEX_STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
      this.log("Developer", "developer", "Tizim ma'lumotlari zaxira faylidan tiklandi");
      return true;
    } catch (e) {
      throw new Error("Fayl formati noto'g'ri: " + e.message);
    }
  },

  // Test ma'lumotlarni tozalash (faqat asosiy boshlang'ich hisoblarni qoldirgan holda)
  clearTestData() {
    localStorage.setItem(TOPEX_STORAGE_KEYS.GROUPS, JSON.stringify([]));
    localStorage.setItem(TOPEX_STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.removeItem("topex_ustoz_panel_v3");
    localStorage.removeItem("topex_teacher_cache");
    localStorage.removeItem("topex_chats_store");
    this.log("Developer", "developer", "Test ma'lumotlari to'liq tozalandi");
  }
};

// Avtomatik initsializatsiya
if (typeof localStorage !== "undefined") {
  TopexDB.init();
}

// Global avtomatik telefon maskasi delegatsiyasi (barcha sahifalar va modallar uchun)
if (typeof document !== "undefined") {
  document.addEventListener("focusin", (e) => {
    const target = e.target;
    if (target && target.tagName === "INPUT") {
      const isTel = target.type === "tel" || target.name === "phone" || (target.id && target.id.includes("phone"));
      if (isTel && !target._hasPhoneMask) {
        TopexDB.bindPhoneInput(target);
      }
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TopexDB;
}
