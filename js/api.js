/**
 * TOPEX Ustoz Paneli — API Integratsiya Qatlami
 * Asosiy TOPEX CRM bilan xavfsiz va to'liq sinxronlashuv
 */
const API = {
  tokenKey: "topex_teacher_token",
  userKey: "topex_teacher_user",
  cachedDataKey: "topex_teacher_cache",

  // Joriy saqlangan token
  getToken() {
    try {
      return localStorage.getItem(this.tokenKey) || "";
    } catch (e) {
      return "";
    }
  },

  // Sessiyani saqlash
  setSession(token, user) {
    try {
      if (token) localStorage.setItem(this.tokenKey, token);
      if (user) localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (e) {
      console.error("Session saqlashda xatolik:", e);
    }
  },

  // Joriy foydalanuvchi ma'lumotlari
  getUser() {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Tizimga kirilganligini tekshirish
  isLoggedIn() {
    return !!this.getToken();
  },

  // Sessiyani tozalash (Logout)
  clearSession() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.cachedDataKey);
    } catch (e) {
      console.error("Session tozalashda xatolik:", e);
    }
  },

  // Asosiy HTTP so'rov yuboruvchi yordamchi
  async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
        credentials: "same-origin"
      });

      const contentType = response.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        // Agar 401 (avtorizatsiyadan o'tmagan) yoki 403 (bloklangan) bo'lsa va bu login so'rovi bo'lmasa, sessiyani tozalaymiz
        if ((response.status === 401 || response.status === 403) && !endpoint.includes("/login")) {
          this.clearSession();
        }
        const errorMsg = data && (data.error || data.message) ? (data.error || data.message) : `Xatolik: ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.warn(`API so'rovi xatosi [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // 1. Tizimga kirish (Login)
  async login(phone, password) {
    const res = await this.request("/api/login", {
      method: "POST",
      body: JSON.stringify({ phone, password })
    });

    if (res && res.token) {
      this.setSession(res.token, res.user);
    }
    return res;
  },

  // 2. Tizimdan chiqish (Logout)
  async logout() {
    try {
      await this.request("/api/logout", { method: "POST" });
    } catch (e) {
      // Offline yoki tarmoq xatosi bo'lsa ham lokal sessiyani tozalaymiz
    } finally {
      this.clearSession();
    }
  },

  // 3. Joriy sessiyani serverdan tekshirish
  async getMe() {
    return await this.request("/api/me");
  },

  // 4. Ustozning real ma'lumotlarini serverdan yuklab olish
  async getTeacherData() {
    const data = await this.request("/api/teacher/data");
    try {
      // Offline fallback uchun oxirgi ma'lumotlarni keshlab qo'yamiz
      localStorage.setItem(this.cachedDataKey, JSON.stringify(data));
    } catch (e) {}
    return data;
  },

  // Keshdagi ma'lumotlarni olish (tarmoq uzilganda)
  getCachedData() {
    try {
      const raw = localStorage.getItem(this.cachedDataKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // 5. Davomatni saqlash
  async saveAttendance(groupId, date, records) {
    return await this.request("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ groupId, date, records })
    });
  },

  // 6. Bahoni saqlash
  async saveGrade(groupId, studentId, date, grade, key = "", note = "") {
    return await this.request("/api/grades", {
      method: "POST",
      body: JSON.stringify({ groupId, studentId, date, grade, key, note })
    });
  },

  // 7. Vazifa qo'shish
  async addHomework(homeworkData) {
    return await this.request("/api/homework", {
      method: "POST",
      body: JSON.stringify(homeworkData)
    });
  },

  // 8. Vazifa bajarilganligini belgilash
  async toggleHomework(homeworkId, studentId, done) {
    return await this.request("/api/homework/toggle", {
      method: "POST",
      body: JSON.stringify({ homeworkId, studentId, done })
    });
  },

  // 9. Vazifani o'chirish
  async deleteHomework(homeworkId) {
    return await this.request(`/api/homework/${homeworkId}`, {
      method: "DELETE"
    });
  },

  // 10. O'quvchi qo'shish (biriktirish)
  async addStudent(studentData) {
    return await this.request("/api/student", {
      method: "POST",
      body: JSON.stringify(studentData)
    });
  },

  // 11. O'quvchini tahrirlash
  async updateStudent(studentId, studentData) {
    return await this.request(`/api/student/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(studentData)
    });
  },

  // 12. O'quvchini o'chirish / arxivlash
  async deleteStudent(studentId) {
    return await this.request(`/api/student/${studentId}`, {
      method: "DELETE"
    });
  },

  // 13. Guruh qo'shish
  async addGroup(groupData) {
    return await this.request("/api/groups", {
      method: "POST",
      body: JSON.stringify(groupData)
    });
  },

  // 14. Guruhni tahrirlash
  async updateGroup(groupId, groupData) {
    return await this.request(`/api/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(groupData)
    });
  },

  // 15. Profil ma'lumotlarini yangilash
  async updateProfile(profileData) {
    return await this.request("/api/teacher/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
  },

  // 16. Parolni yangilash
  async updatePassword(currentPassword, newPassword) {
    return await this.request("/api/teacher/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // 17. Server va baza holatini tekshirish
  async checkStatus() {
    return await this.request("/api/status");
  },

  // 18. Sun'iy Intellekt (AI) bilan chat
  async chatWithAI(message, groupName = "", groupId = "") {
    return await this.request("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, groupName, groupId })
    });
  },

  // 19. Chat xabarini serverga yuborish
  async sendChatMessage(chatId, message) {
    try {
      return await this.request("/api/chats", {
        method: "POST",
        body: JSON.stringify({ chatId, message })
      });
    } catch (e) {
      // Tarmoqda xatolik bo'lsa ham lokal saqlanadi
      return null;
    }
  }
};
