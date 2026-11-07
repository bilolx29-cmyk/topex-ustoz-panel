/**
 * TOPEX Texnikum — Ma'lumotlar Saqlash Qatlami (Store)
 * localStorage asosida xavfsiz va avtomatik sinxronizatsiya
 */
const KEY = "topex_ustoz_panel_v3";

const Store = {
  state: null,

  load() {
    try {
      let raw = localStorage.getItem(KEY);
      if (!raw) {
        // Eski v2 dan ma'lumotlarni ko'chirish, lekin eski baholarni tozalash
        const v2Raw = localStorage.getItem("topex_ustoz_panel_v2");
        if (v2Raw) {
          try {
            const v2State = JSON.parse(v2Raw);
            v2State.grades = {}; // Eski jurnaldagi barcha baholarni tozalash
            this.state = v2State;
            this.save();
          } catch(e) {}
        }
      } else {
        this.state = JSON.parse(raw);
      }

      if (!this.state) {
        this.state = JSON.parse(JSON.stringify(SEED));
      }

      // Eski jurnaldagi dummy baholar bo'lsa, tozalash
      if (this.state.grades) {
        Object.keys(this.state.grades).forEach(k => {
          if (k.includes("|t")) {
            delete this.state.grades[k];
          }
        });
      } else {
        this.state.grades = {};
      }

      // Yangi maydonlar mavjudligini kafolatlash
      if (!this.state.announcements) this.state.announcements = JSON.parse(JSON.stringify(SEED.announcements || []));
      if (!this.state.settings) this.state.settings = JSON.parse(JSON.stringify(SEED.settings || { soundEnabled: true }));
      if (!this.state.teacher.salaryBreakdown) this.state.teacher.salaryBreakdown = SEED.teacher.salaryBreakdown;
    } catch (e) {
      console.error("Store load error:", e);
      this.state = JSON.parse(JSON.stringify(SEED));
    }

    if (!this.state.session) {
      this.state.session = { in: true, theme: "light" }; // Avtomatik tizimga kirgan holatda taqdim etamiz
    }
    return this.state;
  },

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Store save error:", e);
    }
  },

  reset() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem("topex_ustoz_panel_v1");
    } catch (e) { /* ignore */ }
    this.load();
  },

  uid(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
  }
};
